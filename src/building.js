const { chunks, emit, triggerEvent, players, SAVE_INTERVAL, util } = require('./bullet')

// TODO: get structure data somewhere (is_door, is_breakable, etc)

module.exports.playerConnect = function(player) {
  if(player.private.breakStructure !== undefined)
  {
    const { x, y, item, time } = player.private.breakStructure;
    player.temp.breaking = {x, y, item, time};
    player.addPropToQueue('breaking');
  }
}

module.exports.tick = function(player) {
  if(player.temp.placeStructure !== undefined)
  {
    const { id, x, y } = player.temp.placeStructure;
    emit('travelers', 'takePlayerItem', id, 1, player);
    const structure = {};
    emit('travelers', 'createStructure', x, y, id, structure);
    if(Object.keys(structure).length === 0)return;
    emit('travelers', 'placeStructure', structure, player);
  }
  else if(player.private.breakStructure !== undefined)
  {
    if(player.private.breakStructure.time > 0)
    {
      player.temp.break_time = player.private.breakStructure.time;
      player.private.breakStructure.time -= player.private.breakStructure.speed;
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

module.exports.build = function(packet, player) {
  if(packet.option === 'add')
  {
    if(typeof packet.material !== 'string' || typeof packet.dir !== 'string')return;
    const buildItemId = packet.material;
    // check if player has item
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
      const { x: buildX, y: buildY } = util.compassChange(player.public.x, player.public.y, packet.dir, 1);
      player.temp.placeStructure = {id: buildItemId, x: buildX, y: buildY};
    }
  }
  else if(packet.option === 'cancel')
  {
    player.temp.placeStructure = undefined;
  }
}

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
  // TODO: break with different tools
  let breakSpeed = 1;
  let breakItem = 'hands'
  if(packet.option !== breakItem)
  {
    // Change break speed
  }

  const item = {};
  emit('travelers', 'getItem', structure.private.id, item);

  player.private.breakStructure = {x: breakX, y: breakY, item: breakItem, time: item.break_time, speed: breakSpeed};
}

module.exports.cancel_break = function(_packet, player) {
  player.private.breakStructure = undefined;
}

module.exports.createStructure = function(x, y, itemId, structurePtr) {
  const item = {};
  emit('travelers', 'getItem', itemId, item);
  if(Object.keys(item).length < 1 || !item.build)return;
  structurePtr.public = {};
  Object.assign(structurePtr.public, {x, y, char: item.icon, is_door: false, is_breakable: true, walk_over: false});
  structurePtr.private = {id:item.name};
}

module.exports.placeStructure = function(structure, player) {
  if(chunks.getObject(structure.public.x, structure.public.y) !== undefined)return;
  emit('travelers', 'structurePlaced::' + structure.private.id, structure, player);
  chunks.addObject(structure.public.x, structure.public.y, structure.public, structure.private);
}

module.exports.breakStructure = function(x, y, player) {
  const placedStructure = chunks.getObject(x, y);
  if(placedStructure !== undefined)
  {
    emit('travelers', 'structureBroke::' + placedStructure.private.id, placedStructure, player);
    chunks.removeObject(placedStructure.public.x, placedStructure.public.y);
  }
}