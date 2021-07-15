const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');
const { item, givePlayerItem, giveItemToPlayer } = require('./supplies');

const levelUnlocks = [];

function canMake(player, id) {
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
		player.addPropToQueue('craft_queue');
	}
}

module.exports.cancelAll = function(packet, player) {
	if(player.public.craft_queue && player.public.state === 'travel')
	{
		for(const id in player.public.craft_queue)
		{
			const target = item(player.public.craft_queue[id].item_id);
			for(const ingredientId in target.craft_data)
			{
				giveItemToPlayer(ingredientId, target.craft_data[ingredientId].count, player);
			}
		}
		player.public.craft_queue = undefined;
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
			if(clientList[craftable] === undefined)
			{
				clientList[craftable] = [];
			}
			const obj = {};
			obj[craftable.id] = item(craftable.id);
			clientList[craftable].push(obj);
		}
		clientList.blueprints = [];// TODO
		player.temp.craft_items = clientList;
		player.addPropToQueue('craft_items');
	}
}