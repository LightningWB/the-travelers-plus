const crypto = require('crypto');
const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');
const getItem = require('./supplies').item;
const giveItemToPlayer = require('./supplies').giveItemToPlayer;

// if someone uses public event ids to brute force this, nice job to them. they can see button target ids until the server restarts.
const salt = util.randomString(9);

// to save player in correct room
const hashTable = {};

function hash(str)
{
	const cipher = crypto.createHash('sha512');
	cipher.update(str + salt)
	const result = cipher.digest('hex');
	hashTable[result] = str;
	return result;
}

function addData(storage) {
	const result = {};
	for(const key of Object.keys(storage)) {
		result[key] = {
			count: storage[key],
			data: getItem(key)
		}
	}
	return result;
}

module.exports.addData = addData;

/**
 * @type {import('./events').eventTotal}
 */
const events = {};

module.exports.addEvent = function(type, data) {
	if(events[type] === undefined)
	{
		events[type] = [];
	}
	events[type].push(data);
}

module.exports.onAddEvent = function(type, data) {
	const oldData = util.clone(data);
	data.weight = parseInt(data.weight);
	data.rooms = {};
	for(const roomId in oldData.rooms)
	{
		const room = oldData.rooms[roomId];
		let newId = roomId;
		if(room.id !== 'main')
		{
			newId = hash(room.id);
			const newRoom = util.clone(room);
			newRoom.id = newId;
			data.rooms[newId] = newRoom;
		}
		else data.rooms.main = util.clone(oldData.rooms.main);
		if(data.rooms[newId].btns) for(const btn of data.rooms[newId].btns)
		{
			if(typeof btn === 'object')
			{
				if(btn.for !== 'main')btn.for = hash(btn.for);
				if(btn.reqTarget)btn.reqTarget = hash(btn.reqTarget);
				if(btn.lockTarget)btn.lockTarget = hash(btn.lockTarget);
			}
		}
		if(data.rooms[newId].loot)// hash loot ids
		{
			data.rooms[newId].nextId = hash(data.rooms[newId].nextId);
		}
		if(data.rooms[newId].visitTarget)// hash visit targets
		{
			data.rooms[newId].visitTarget = hash(data.rooms[newId].visitTarget);
		}
	}
}

/**
 * @param {import('./events').eventData[]} events 
 */
function chooseEvent(events)
{
	let total = 0;
	events.forEach(e => {
		total += e.weight;
	});
	let randLeft = Math.floor(Math.random() * total);
	for(const event of events)
	{
		randLeft -= event.weight;
		if(randLeft <= 0)return event;
	}
	return events[0];// if there is somehow an error with randomness
}

/**
 * @param {players.player} player 
 * @returns {import('./event types'.room)}
 */
function getRoom(player)
{
	return events[player.private.eventData.type].find(e=>e.id === player.private.eventData.id).rooms[player.private.eventData.room];
}

function getEvent(x, y)
{
	const obj = chunks.getObject(x, y);
	if(obj)
	{
		return obj.private.eventData;
	}
	return obj
}

/**
 * @param {import('./event types').room} room
 */
function compileBtns(room)
{
	room.btns = room.btns.map(e=>{
		if(typeof e === 'string')return {
			for: '__leave__',
			text: 'exit event',
			req: false
		};
		else return e;
	});
}

function checkRoomAction(player)
{
	const room = getRoom(player);
	if(!room) return;
	if(room.action && room.action.includes('::'))
	{
		const splitUp =  room.action.split('::');
		emit(splitUp[0], splitUp[1], player);
	}
}

/**
 * @param {players.player} player 
 */
module.exports.movePlayerToEvent = function(player, type) {
	if(type === 'house')
	{
		if(getEvent(player.public.x, player.public.y) === undefined)chunks.addObject(player.public.x, player.public.y, {
				x: player.public.x,
				y: player.public.y,
				char: 'H',
				is_door: false,
				is_breakable: false,
				walk_over: false
			},
			{
				eventData: {
					loot: {},
					type: type,
					id: chooseEvent(events[type]).id
				},
				visited: false
			});
	}
	else if(type === 'city')
	{
		if(getEvent(player.public.x, player.public.y) === undefined)chunks.addObject(player.public.x, player.public.y, {
				x: player.public.x,
				y: player.public.y,
				char: 'C',
				is_door: false,
				is_breakable: false,
				walk_over: false
			},
			{
				eventData: {
					loot: {},
					type: type,
					id: chooseEvent(events[type]).id
				},
				visited: false
			}
		);
	}
	if(player.public.state === 'travel')
	{
		emit('travelers', 'stopPlayerMovement', player);
		const eventObj = chunks.getObject(player.public.x, player.public.y);
		player.private.eventData = {
			room: 'main',
			type: eventObj.private.eventData.type,
			id: eventObj.private.eventData.id
		};
		player.public.state = 'event';
		player.addPropToQueue('state');
		checkRoomAction(player);
		emit('travelers', 'calcPlayerEvent', player);
	}
}

/**
 * @param {players.player} player 
 */
module.exports.calcPlayerEvent = function(player) {
	if(player.public.state === 'event' || player.public.state === 'looting')
	{
		const activeRoom = getRoom(player);
		const eventObj = getEvent(player.public.x, player.public.y);
		if(!eventObj || !activeRoom)// if the event was deleted somehow or they are in an invalid room
		{
			player.public.state = 'travel';
			player.private.eventData = undefined;
			player.addPropToQueue('state');
			return;
		}
		if(!eventObj.visitedRooms) {
			eventObj.visitedRooms = [];
		}
		if(activeRoom.loot)// looting screen
		{
			let visited = true;
			let items = {};
			if(!eventObj.loot[activeRoom.id])
			{
				visited = false;// hasn't been visited so use non visited description
				emit('travelers', 'generateLoot', activeRoom, eventObj.loot[activeRoom.id] = {});
				
				items = addData(eventObj.loot[activeRoom.id]);
			}
			else for(const item in eventObj.loot[activeRoom.id])
			{
				const i = eventObj.loot[activeRoom.id][item];
				items[item] = {count: i, data: getItem(item)};
			}
			const loot = {
				title: activeRoom.title,
				visited: visited,
				items: items,
				desc: activeRoom.body
			};
			if(visited && activeRoom.visitedBody)// add visit text
			{
				loot.visitdesc = activeRoom.visitedBody;
			}
			player.temp.loot = loot;
			player.temp.item_limit = activeRoom.size || 20;
			player.public.state = 'looting';
			player.addPropToQueue('loot', 'item_limit', 'state');
		}
		else// normal event screen
		{
			compileBtns(activeRoom);// replace the "leave" with a real button
			const btns = {};
			for(let btn of activeRoom.btns)
			{
				if(btn.req)
				{
					const endBtn = {
						req_text: btn.text,
						text: btn.text,
						has_req: true,
						req_break_items: btn.reqConsume,
						req_items: {},
						hide_req: btn.hide,
						// TODO: these properties
						req_for_all: btn.reqForAll,
						req_has_lockout: false,
						req_is_now_locked: false,
						req_will_hide: false
					};
					if(btn.reqItems)for(const item of btn.reqItems)// convert the event array to an object that toro uses
					{
						endBtn.req_items[item.id] = {title: item.title, count: item.count};
					}
					let reqMet = true;
					if(btn.reqForAll === false)
					{
						const targetRoom = btn.reqTarget || btn.for;
						if(eventObj.visitedRooms.includes(targetRoom))
						{
							reqMet = true;
							endBtn.req_met = reqMet;
						}
					}
					else for(const item of btn.reqItems)
					{
						if(!player.private.supplies[item.id] || player.private.supplies[item.id] < item.count)reqMet = false;
					}
					if(!(endBtn.hide_req && !reqMet))// don't send hidden btns to the client
					{
						btns[btn.for] = endBtn;
					}
				}
				else if(btn.lock)
				{
					if(!eventObj.visitedRooms.includes(btn.lockTarget || btn.for))btns[btn.for] = {
						text: btn.text
					};
				}
				else btns[btn.for] = {
					text: btn.text
				};
			}
			const stageData = {
				title: activeRoom.title,
				desc: activeRoom.body,
				btns:btns
			}
			// check if the looting room exists
			let visited = false;
			if(activeRoom.visitTarget)
			{
				if(eventObj.visitedRooms.includes(activeRoom.visitTarget))// loot already exists
				{
					visited = true;
				}
			}
			if(visited && activeRoom.visitedBody)// add visit text
			{
				stageData.visited = activeRoom.visitedBody;
			}
			player.temp.event_data = {
				visited: visited,
				stage_data: stageData
			};
			player.public.state = 'event';
			player.addPropToQueue('event_data', 'state');
		}
		if(!eventObj.visitedRooms.includes(activeRoom.id))
		{
			eventObj.visitedRooms.push(activeRoom.id);
		}
	}
}

/**
 * @param {import('./event types').room} room
 * @param {util.anyObject} items 
 */
module.exports.generateLoot = function(room, items) {
	const table = room.lootTable || [];
	for(const tableItem of table)
	{
		if(Math.random() <= tableItem.chance)
		{
			const amount = Math.floor(Math.random() * (tableItem.max - tableItem.min) + tableItem.min);
			if(items[tableItem.id] === undefined)
			{
				const item = {};
				emit('travelers', 'getItem', tableItem.id, item);
				items[tableItem.id] = 0;
			}
			items[tableItem.id] += amount;

		}
	}
}

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.event_choice = function(packet, player) {
	if(player.public.state === 'event' && typeof packet.option === 'string')
	{
		const activeRoom = getRoom(player);
		const eventObj = getEvent(player.public.x, player.public.y);
		compileBtns(activeRoom);
		// verify they can press the button
		const targetBtn = activeRoom.btns.find(b=>b.for === packet.option);
		if(targetBtn)
		{
			if(packet.option === '__leave__')
			{
				player.public.state = 'travel';
				player.private.eventData = undefined;
				player.addPropToQueue('state');
			}
			else
			{
				let reqMet = true;
				if(targetBtn.req)
				{
					// check if this is a locked thing
					if(targetBtn.lock && eventObj.visitedRooms.includes(targetBtn.lockTarget || targetBtn.for))reqMet = false;
					// if its already been opened
					else if(targetBtn.reqForAll === false && eventObj.visitedRooms.includes(targetBtn.reqTarget || targetBtn.for))reqMet = true;
					// just if they have items
					else if(targetBtn.reqItems)for(const item of targetBtn.reqItems)
					{
						if(!player.private.supplies[item.id] || player.private.supplies[item.id] < item.count)reqMet = false;
					}
				}
				if(reqMet)// make sure they are permitted to pass
				{
					if(targetBtn.reqConsume)
					{
						for(const item of targetBtn.reqItems)
						{
							emit('travelers', 'takePlayerItem', item.id, item.count, player);
						}
						emit('travelers', 'calcWeight', player);
						emit('travelers', 'renderPlayerItems', player);
					}
					player.private.eventData.room = targetBtn.for;
					checkRoomAction(player);
					emit('travelers', 'calcPlayerEvent', player);
				}
			}
		}
	}
}

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.loot_next = function(packet, player) {
	if(player.public.state === 'looting')
	{
		const activeRoom = getRoom(player);
		if(activeRoom.loot)
		{
			player.private.eventData.room = activeRoom.nextId || 'leave';
			if(player.private.eventData.room === 'leave')
			{
				player.public.state = 'travel';
				player.private.eventData = undefined;
				player.addPropToQueue('state');
			}
			else checkRoomAction(player);
			emit('travelers', 'calcPlayerEvent', player);
			emit('travelers', 'renderItems', player);
		}
	}
}

function lootExchange(packet, player, storage, size) {
	const loot = storage;
	packet.amount = Math.abs(packet.amount);
	// taking items
	if(packet.which)
	{
		if(loot[packet.item] && packet.amount !== 0)
		{
			if(loot[packet.item].count < packet.amount)packet.amount = loot[packet.item].count;
			let d = {};
			emit('travelers', 'getItem', packet.item, d);
			let takingWeight = packet.amount * d.weight;
			let availableWeight = player.public.skills.max_carry - player.public.skills.carry;
			while(takingWeight > availableWeight && packet.amount > 0)
			{
				packet.amount--;
				takingWeight = packet.amount * d.weight;
			}
			if(packet.amount <= 0)return;
			emit('travelers', 'givePlayerItem', packet.item, packet.amount, player);
			emit('travelers', 'removeItem', packet.item, packet.amount, loot);
			player.sendMidCycleCall({loot_change: {
				amount: packet.amount,
				item_id: packet.item,
				was_you: true,
				which: true,
				item_data: d
			}});
		}
		emit('travelers', 'calcWeight', player);
	}
	// giving items
	else if(!packet.which)
	{
		// check they can give it
		if(player.private.supplies[packet.item] && player.private.supplies[packet.item] >= packet.amount && packet.amount !== 0)
		{
			if(player.private.supplies[packet.item] && player.private.supplies[packet.item].count < packet.amount)packet.amount = player.private.supplies[packet.item];
			let d = {};
			emit('travelers', 'getItem', packet.item, d);
			let currentWeight = 0;
			for(const item in loot)
			{
				currentWeight += loot[item] * d.weight;
			}
			let givingWeight = packet.amount * d.weight;
			let availableWeight = (size || 200) - currentWeight;
			while(givingWeight > availableWeight && packet.amount > 0)
			{
				packet.amount--;
				givingWeight = packet.amount * d.weight;
			}
			if(packet.amount <= 0)return;
			emit('travelers', 'givePlayerItem', packet.item, packet.amount * -1, player);
			emit('travelers', 'addItem', packet.item, packet.amount, loot);
			player.sendMidCycleCall({loot_change: {
				amount: packet.amount,
				item_id: packet.item,
				was_you: true,
				which: false,
				item_data: d
			}});
			if(player.public.equipped === packet.item && (player.private.supplies[packet.item] === undefined || player.private.supplies[packet.item] < 1))
			{
				player.addPropToQueue('equipped');
				player.public.equipped = undefined;
			}
		}
	}
	emit('travelers', 'calcWeight', player);
}

module.exports.int_exchange = function(packet, player) {
	if(typeof packet.item === 'string' && typeof packet.amount === 'number' && typeof packet.which === 'boolean' && typeof player.private.lootingPlayer === 'string')
	{
		const p = players.getPlayerByUsername(player.private.lootingPlayer);
		lootExchange(packet, player, p.private.supplies, p.public.skills.max_carry);
	}
}

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.loot_exchange = function(packet, player) {
	if(player.public.state === 'looting' && typeof packet.item === 'string' && typeof packet.amount === 'number' && typeof packet.which === 'boolean')
	{
		const eventObj = getEvent(player.public.x, player.public.y);
		const activeRoom = getRoom(player);
		if(eventObj && eventObj.type === player.private.eventData.type && eventObj.id === player.private.eventData.id)
		{
			const loot = eventObj.loot[player.private.eventData.room];
			lootExchange(packet, player, loot, activeRoom.size);
		}
	}
}

function lootAll(packet, player, storage) {
	let opWeight = 0;
	const loot = storage;
	const compiled = {};
	for(const itemId in loot)
	{
		if(typeof loot[itemId] === 'number' && loot[itemId] > 0)
		{
			const item = getItem(itemId);
			const weight = item.weight;
			let pWeight = player.public.skills.carry;
			let changed = 0;
			while(pWeight + weight < player.public.skills.max_carry && loot[itemId] - changed > 0)
			{
				pWeight += weight;
				changed++;
			}
			loot[itemId] -= changed;
			giveItemToPlayer(itemId, changed, player);
			opWeight += weight * loot[itemId];
			if(loot[itemId] === 0)loot[itemId] = undefined;
			else compiled[itemId] = {count: loot[itemId], data: item};
		}
	}
	emit('travelers', 'renderItems', player, false);
	player.sendMidCycleCall({loot_change: {
		takeall: true,
		was_you: true,
		your_new: player.temp.supplies,
		your_weight: player.public.skills.carry,
		opp_weight: opWeight,
		opp_new: compiled
	}});
}

module.exports.int_takeall = function(packet, player) {
	if(typeof player.private.lootingPlayer === 'string') {
		if(!players.isPlayerOnline(player.private.lootingPlayer)) {
			const targetPlayer = players.getPlayerByUsername(player.private.lootingPlayer)
			if(!targetPlayer) return false;
			lootAll(packet, player, targetPlayer.private.supplies);
		}
	}
}

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.loot_all = function(packet, player) {
	if(player.public.state === 'looting')
	{
		const eventObj = getEvent(player.public.x, player.public.y);
		if(eventObj && eventObj.type === player.private.eventData.type && eventObj.id === player.private.eventData.id)
		{
			const loot = eventObj.loot[player.private.eventData.room];
			lootAll(packet, player, loot);
		}
	}
}

/**
 * @param {players.player} player 
 */
module.exports.movePlayer = function(player) {
	if(player.cache.travelData.dir === '')return;
	const tile = generateTileAt(player.public.x, player.public.y);
	if(getEvent(player.public.x, player.public.y) && chunks.getObject(player.public.x, player.public.y).private.visible !== false)
	{
		emit('travelers', 'movePlayerToEvent', player, 'any');
	}
	else if(tile === 'H')
	{
		emit('travelers', 'movePlayerToEvent', player, 'house');
	}
	else if(tile === 'C')
	{
		emit('travelers', 'movePlayerToEvent', player, 'city');
	}
}

module.exports.reEnter = function(packet, player) {
	if(player.public.state === 'travel')
	{
		if(getEvent(player.public.x, player.public.y))
		{
			emit('travelers', 'movePlayerToEvent', player, 'any');
		}
	}
}

/**
 * @param {players.player} player 
 */
module.exports.playerJoin = function(player) {
	if(player.private.supplies === undefined)player.private.supplies = {};
	emit('travelers', 'calcPlayerEvent', player);
}

/**
 * @param {players.player} player 
 */
module.exports.playerCreate = function(player) {
	if(player.private.supplies === undefined)player.private.supplies = {};
}

module.exports.savePlayer = function(player) {
	if(player.private.eventData) {
		if(player.private.eventData.room !== 'main')player.private.eventData.room = hashTable[player.private.eventData.room];
	}
}

module.exports.loadPlayer = function(player) {
	if(player.private.eventData) {
		if(player.private.eventData.room !== 'main')player.private.eventData.room = hash(player.private.eventData.room);
	}
}

module.exports.saveChunk = function(chunk) {
	for(const id in chunk)
	{
		if(id !== 'meta' && chunk[id])
		{
			const objs = chunk[id];
			objs.forEach(o=>{
				if(o.private.eventData)
				{
					for(const id in o.private.eventData.loot)
					{
						for(const lootable in o.private.eventData.loot[id])
						{
							if(o.private.eventData.loot[id][lootable])
							{
								if(o.private.eventData.loot[id][lootable] > 0)o.private.eventData.loot[id][lootable] = o.private.eventData.loot[id][lootable];
								else o.private.eventData.loot[id][lootable] = undefined;
							}
						}
					}
					const unHashed = {};
					for(const id in o.private.eventData.loot)
					{
						if(id !== 'main')unHashed[hashTable[id]] = o.private.eventData.loot[id];
						else unHashed.main = o.private.eventData.loot[id];
					}
					o.private.eventData.loot = unHashed;
					if(Array.isArray(o.private.eventData.visitedRooms))
					{
						o.private.eventData.visitedRooms = o.private.eventData.visitedRooms.map(name=> name === 'main' ? 'main' : hashTable[name]);
						if(o.private.eventData.visitedRooms.length === 0)o.private.eventData.visitedRooms = undefined;// db space saver
					}
				}
			});
		}
	}
}

module.exports.loadChunk = function(chunk) {
	for(const id in chunk)
	{
		if(id !== 'meta')
		{
			const objs = chunk[id];
			objs.forEach(o=>{
				if(o.private.eventData)
				{
					for(const id in o.private.eventData.loot)
					{
						for(const lootable in o.private.eventData.loot[id])
						{
							o.private.eventData.loot[id][lootable] = o.private.eventData.loot[id][lootable];
						}
					}
					const hashed = {};
					for(const id in o.private.eventData.loot)
					{
						if(id !== 'main')hashed[hash(id)] = o.private.eventData.loot[id];
						else hashed.main = o.private.eventData.loot[id];
					}
					o.private.eventData.loot = hashed;
					if(Array.isArray(o.private.eventData.visitedRooms))
					{
						o.private.eventData.visitedRooms = o.private.eventData.visitedRooms.map(name=> name === 'main' ? 'main' : hash(name));
					}
					else o.private.eventData.visitedRooms = [];// allow malformed objects to be fine
				}
			});
		}
	}
}

module.exports.addEventTile = function(x, y, char, id, type)
{
	if(id && type)
	{
		chunks.addObject(x, y, {
			char: char,
			is_door: false,
			is_breakable: false,
			walk_over: false,
		}, {
			eventData: {
				loot: {},
				type: type,
				id: id,
				visitedRooms: []
			}
		});
	}
	else
	{
		chunks.addObject(x, y, {
			char: char,
			is_door: false,
			is_breakable: false,
			walk_over: false,
		}, {});
	}
}

module.exports.placeEvent = function(x, y, char, id, type)
{
	emit('travelers', 'addEventTile', x, y, char, id, type);
}