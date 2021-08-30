const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');
const { item, givePlayerItem, giveItemToPlayer, takePlayerItem } = require('./supplies');

const levelUnlocks = [];

function canMake(player, id) {
	if((player.private.bps || []).includes(id))return true;
	const craftItem = item(id);
	const levelUnlockData = levelUnlocks.find(e=>e.id === id);
	if(craftItem.craft && levelUnlockData && player.public.skills.level >= levelUnlockData.level)
	{
		for(const id in craftItem.craft_data)
		{
			if(!player.private.supplies || !player.private.supplies[id] || player.private.supplies[id] < craftItem.craft_data[id].count)
			{
				return false;
			}
		}
		return true;
	}
	return false;
}

function addItemToPlayerCraftingQueue(id, time, player) {
	if(!player.public.craft_queue)
	{
		player.public.craft_queue = {};
	}
	let randString = util.randomString(8);
	while(player.public.craft_queue[randString] !== undefined)
	{
		randString = util.randomString(8);
	}
	player.public.craft_queue[randString] = {item_id: id, remaining: time};
	player.addPropToQueue('craft_queue');
}

/**
 * @param {players.player} player 
 */
module.exports.tick = function(player) {
	if(player.public.craft_queue && player.public.state === 'travel')
	{
		const activeIds = [];
		for(const id in player.public.craft_queue)
		{
			if(player.public.craft_queue[id])
			{
				player.public.craft_queue[id].remaining--;
				if(player.public.craft_queue[id].remaining <= 0)
				{
					giveItemToPlayer(player.public.craft_queue[id].item_id, 1, player);
					emit('travelers', 'renderItems', player);
				}
				else activeIds.push(id);
			}
		}
		const newQueue = {};
		for(const id of activeIds)
		{
			newQueue[id] = player.public.craft_queue[id];
		}
		if(activeIds.length > 0)player.public.craft_queue = newQueue;
		else player.public.craft_queue = undefined;
		player.temp.craft_queue = {};
		player.addPropToQueue('craft_queue');
	}
}

module.exports.cancelAll = function(packet, player, addToQueue = true) {
	if(player.public.craft_queue)
	{
		for(const id in player.public.craft_queue)
		{
			if(player.public.craft_queue[id])
			{
				const target = item(player.public.craft_queue[id].item_id);
				for(const ingredientId in target.craft_data)
				{
					giveItemToPlayer(ingredientId, target.craft_data[ingredientId].count, player);
				}
			}
		}
		player.public.craft_queue = undefined;
		if(addToQueue !== false)player.addPropToQueue('craft_queue');
		emit('travelers', 'renderItems', player, addToQueue);
	}
}

module.exports.cancelOne = function(packet, player) {
	if(player.public.craft_queue && player.public.state === 'travel' && player.public.craft_queue[packet.item])
	{
		const id = packet.item;
		const target = item(player.public.craft_queue[id].item_id);
		for(const ingredientId in target.craft_data)
		{
			giveItemToPlayer(ingredientId, target.craft_data[ingredientId].count, player);
		}
		player.public.craft_queue[id] = undefined;
		player.addPropToQueue('craft_queue');
		emit('travelers', 'renderItems', player);
	}
}

module.exports.addUnlockLevel = function(id, level) {
	levelUnlocks.push({id: id, level: level});
}

/**
 * @param {object} packet
 * @param {players.player} player 
 */
module.exports.craft = function(packet, player) {
	if(player.public.state !== 'travel')return;
	const craftable = item(packet.item);
	if(!craftable.craft)return;
	const craftData = craftable.craft_data;
	let i = 0;
	while(canMake(player, packet.item) && i < packet.count)
	{
		i++;
		for(const item in craftData)
		{
			giveItemToPlayer(item, -1 * craftData[item].count, player);
		}
		addItemToPlayerCraftingQueue(packet.item, item(packet.item).craft_time, player);
	}
	emit('travelers', 'renderItems', player);
}

module.exports.unlockCrafting = function(player, learningItem)
{
	if(player.private.bps === undefined)player.private.bps = [];
	const bps = player.private.bps;
	if(!bps.includes(learningItem))bps.push(learningItem);
	emit('travelers', 'renderCrafting', player);
}

module.exports.learn = function(packet, player) {
	if(player.public.state === 'travel' && typeof packet.item === 'string')
	{
		const bp = item(packet.item);
		if(bp && bp.is_bp && bp.bp_for)
		{
			const learningItem = bp.bp_for;
			emit('travelers', 'unlockCraftingForPlayer', player, learningItem);
			takePlayerItem(packet.item, 1, player);
			emit('travelers', 'renderItems', player, true);
		}
	}
}

/**
 * @param {players.player} player 
 */
module.exports.connect = function(player) {
	if(player.public.skills)
	{
		const level = player.public.skills.level;
		const ableMake = levelUnlocks.filter(i=> i.level <= level);
		const clientList = {};
		for(const craftable of ableMake)
		{
			if(clientList[craftable.level] === undefined)
			{
				clientList[craftable.level] = [];
			}
			const obj = {};
			obj[craftable.id] = item(craftable.id);
			clientList[craftable.level].push(obj);
		}
		clientList.blueprints = (player.private.bps || []).map(i=>{const o = {}; o[i] = item(i); return o;});
		player.temp.craft_items = clientList;
		player.addPropToQueue('craft_items');
	}
}