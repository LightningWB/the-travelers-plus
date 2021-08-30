const { chunks, emit, triggerEvent, players, SAVE_INTERVAL, util } = require('./bullet')
const getItem = require('./supplies').item;

/**
 * @type {import('./building').fullData}
 */
const STRUCTURE_DATA = {};
const PLACING_TO_ID = {};

module.exports.addStructure = function(data) {
	/**
	 * @type {import('./building').structureData}
	 */
	const defaultData = {
		isDoor: false,
		isBreakable: false,
		standOver: false,
		walkOver: true
	};
	const requiredFields = [
		['char', 'string'],
		['placingItem', 'string'],
		['id', 'string']
	];
	for(const required of requiredFields) {
		if(typeof data[required[0]] !== required[1]) {
			throw 'Invalid type for ' + required[0];
		}
	}
	const item = getItem(data.placingItem);
	if(data.isBreakable) {
		if(data.breakTime === undefined && item.break_time) {
			data.breakTime = item.break_time;
		} else if(item.break_time === undefined && data.breakTime) {
			item.break_time = data.breakTime;
		} else if(data.breakTime === undefined && item.break_time === undefined) {
			throw 'Invalid type for breakTime';
		}
	}
	PLACING_TO_ID[data.placingItem] = data.id;
	STRUCTURE_DATA[data.id] = util.mergeObject(defaultData, data);
}

/**
 * @param {object} obj 
 */
function addPublicDataToObject(obj) {
	const structureId = obj.private.structureId;
	const structureData = STRUCTURE_DATA[structureId];
	if(structureData) {
		obj.public.char = structureData.char;
		obj.public.walk_over = structureData.standOver;// walk_over means show your player in front of an object client side
		obj.public.is_door = structureData.isDoor;
		obj.public.is_breakable = structureData.isBreakable;
		obj.private.walkOn = structureData.walkOver;
    	obj.public.break_time = structureData.breakTime;
	}
}

module.exports.chunkUnload = function(chunk) {
	for(const key in chunk) {
		if(key !== 'meta') {
			for(const obj of chunk[key]) {
				if(obj.private && obj.private.structureId) {// these props get loaded up on runtime to allow changing every fence's texture or something
					delete obj.public.char;
					delete obj.public.walk_over;
					delete obj.public.is_door;
					delete obj.public.is_breakable;
					delete obj.private.walkOn;
          delete obj.public.break_time;
				}
			}
		}
	}
}

module.exports.chunkLoad = function(chunk) {
	for(const key in chunk) {
		if(key !== 'meta') {
			for(const obj of chunk[key]) {
				if(obj.private.structureId) {
					addPublicDataToObject(obj);
				}
			}
		}
	}
}

/**
 * sends breaking info to player on connection
 * @param {players.player} player 
 */
module.exports.playerConnect = function(player) {
  if(player.private.breakStructure !== undefined)
  {
    const { x, y, item, time } = player.private.breakStructure;
    player.temp.breaking = {x, y, item, time};
    player.addPropToQueue('breaking');
  }
}

/**
 * places structure if prepared to.
 * damages structure if breaking it
 * @param {players.player} player 
 * @returns 
 */
module.exports.tick = function(player) {
  if(player.temp.placeStructure !== undefined)
  {
    // removes item from player and places it
    const { id, x, y } = player.temp.placeStructure;
    emit('travelers', 'takePlayerItem', id, 1, player);
	emit('travelers', 'renderItems', player);
    emit('travelers', 'placeStructure', player.temp.placeStructure, player);
  }
  else if(player.private.breakStructure !== undefined)
  {
    if(player.private.breakStructure.time > 0)
    {
      player.temp.break_time = player.private.breakStructure.time;
      --player.private.breakStructure.time;
    }else
    {
      player.temp.break_time = -1;
      const { x: structureX, y: structureY } = player.private.breakStructure;
      emit('travelers', 'breakStructure', structureX, structureY, player);
      player.private.breakStructure = undefined;
    }
    player.addPropToQueue("break_time");
  }
}

/**
 * checks if player can place structure and sets or cancels the build queue.
 * @param {any} packet 
 * @param {players.player} player 
 * @returns 
 */
module.exports.build = function(packet, player) {
  if(packet.option === 'add')
  {
    if(typeof packet.material !== 'string' || typeof packet.dir !== 'string')return;
    const buildItemId = packet.material;

    // check if player has item (which confirms that this is a real item)
    const playerSupplies = player.private.supplies;
    let playerHasItem = false;
    for(const suppliesItemId in playerSupplies)
    {
      if(suppliesItemId === buildItemId)
      {
        playerHasItem = true;
        break;
      }
    }
  
    if(playerHasItem)
    {
      // placedStructure will be placed in the next tick
      const { x: buildX, y: buildY } = util.compassChange(player.public.x, player.public.y, packet.dir, 1);
      player.temp.placeStructure = {id: buildItemId, x: buildX, y: buildY};
    }
  }
  else if(packet.option === 'cancel')
  {
    // clears the queue
    player.temp.placeStructure = undefined;
  }
}

/**
 * starts breaking a structure
 * @param {any} packet 
 * @param {players.player} player 
 */
module.exports.break = function(packet, player) {
  // get structure to break
  const { x: breakX, y: breakY } = util.compassChange(player.public.x, player.public.y, packet.dir, 1);
  const structure = chunks.getObject(breakX, breakY);
  if(!structure)
  {
    player.temp.exe_js = 'ENGINE.log(\'cannot break this.\', true);;BUILD.disableDirs(false);';
    player.addPropToQueue('exe_js');
    return;
  }
  
  // get break speed
  let breakTime = structure.public.break_time;
  let breakItem = 'hands'
  if(packet.option !== breakItem)
  {
    const tool = getItem(packet.option);
    if (tool.break_ratio !== undefined)
    {
      breakItem = packet.option;
      // tool.break_ratio% faster
      breakTime = Math.round(structure.public.break_time * (1 - tool.break_ratio / 100));
    }
  }

  // set up breaking data
  player.private.breakStructure = {x: breakX, y: breakY, item: breakItem, time: breakTime};
}

/**
 * clears breaking data
 * @param {any} _packet 
 * @param {players.player} player 
 */
module.exports.cancel_break = function(_packet, player) {
  player.private.breakStructure = undefined;
}

/**
 * cancels player breaking on the server side
 * @param {players.player} player 
 */
module.exports.cancelBreak = function(player) {
  player.private.breakStructure = undefined;
  player.temp.break_time = -1; // To clear the timer on the client
  player.addPropToQueue("break_time");

}

/**
 * 
 * @param {any} structure 
 * @param {players.player} player 
 * @returns 
 */
module.exports.placeStructure = function(data, player) {
	const structureData = STRUCTURE_DATA[PLACING_TO_ID[data.id]];
	if(chunks.isObjectHere(data.x, data.y)) {
		emit('travelers', 'eventLog', 'unable to place object here.', player)
		return;
	}
	const privateData = {
		structureId: structureData.id
	};
	chunks.addObject(data.x, data.y, {}, privateData);
	const obj = chunks.getObject(data.x, data.y);
	addPublicDataToObject(obj)
	emit('travelers', 'structurePlaced::' + structureData.id, obj, player);
}

/**
 * breaks a structure at a position
 * @param {Number} x 
 * @param {Number} y 
 * @param {players.player} player 
 */
module.exports.breakStructure = function(x, y, player) {
  const placedStructure = chunks.getObject(x, y);
  if(placedStructure !== undefined)
  {
    emit('travelers', 'structureBroke::' + placedStructure.private.id, placedStructure, player);
    chunks.removeObject(placedStructure.public.x, placedStructure.public.y);
  }
}