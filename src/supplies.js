const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');

const items = {};

module.exports.getItem = function(id, itemPtr) {
	Object.assign(itemPtr, util.clone(items[id]));
}

module.exports.addGameItem = function(id, item) {
	items[id] = item;
}

module.exports.addGameItems = function(data) {
	for(const id in data)
	{
		emit('travelers', 'addGameItem', id, data[id]);
	}
}

/**
 * @param {players.player} player
 */
module.exports.renderItems = function(player, addToQueue) {
	player.temp.supplies = {};
	for(const id in player.private.supplies)
	{
		if(player.private.supplies[id]) player.temp.supplies[id] = {
			count: player.private.supplies[id],
			data: items[id]
		};
	}
	if(addToQueue)player.addPropToQueue('supplies');
}

module.exports.givePlayerItem = function(id, count, player) {
	if(player.private.supplies[id] === undefined)
	{
		player.private.supplies[id] = 0;
	}
	player.private.supplies[id] += count;
	if(player.private.supplies[id] <= 0)player.private.supplies[id] = undefined;
}

module.exports.takePlayerItem = function(id, count, player) {
	if(player.private.supplies[id] === undefined)
	{
		player.private.supplies[id] = 0;
	}
	player.private.supplies[id] -= count;
	if(player.private.supplies[id] <= 0)player.private.supplies[id] = undefined;
}

module.exports.removeItem = function(id, count, storage) {
	if(!storage[id])
	{
		storage[id] = 0;
	}
	storage[id] -= count;
	if(storage[id] <= 0)
	{
		storage[id] = undefined;
	}
}

module.exports.addItem = function(id, count, storage) {
	if(!storage[id])
	{
		storage[id] = 0;
	}
	storage[id] += count;
	if(storage[id] <= 0)
	{
		storage[id] = undefined;
	}
}

module.exports.playerJoin = function(player) {
	emit('travelers', 'renderItems', player, false);
}

module.exports.admin = function(plugin) {
	function mod(d, m){
		const splitUp = d.split(':');
		if(splitUp.length !== 3)return 'Invalid Parameters';
		splitUp[2] = Number(splitUp[2]);
		if(typeof splitUp[0] !== 'string' || typeof splitUp[1] !== 'string' || typeof splitUp[2] !== 'number')return 'Invalid Parameters';
		let item = {};
		emit('travelers', 'getItem', splitUp[1], item);
		if(Object.keys(item).length === 0)return 'Invalid Item ID';
		if(!players.isPlayerOnline(splitUp[0]))return 'Invalid username or the player is offline';
		const player = players.getOnlinePlayer(splitUp[0]);
		if(m>0)emit('travelers', 'givePlayerItem', splitUp[1], splitUp[2], player);
		else if(m<0)emit('travelers', 'takePlayerItem', splitUp[1], splitUp[2], player);
		emit('travelers', 'calcWeight', player);
		emit('travelers', 'renderItems', player);
		return 'Successfully ' + (m>0 ? 'Added' : 'Removed') + ' Item';
	}
	plugin.addAdminText('givePlayerItem', 'Username:Item ID:Count', 'Give Item', (d)=>mod(d, 1));
	plugin.addAdminText('removePlayerItem', 'Username:Item ID:Count', 'Take Item', (d)=>mod(d, -1));
}


// local event bindings
/**
 * returns an item and its id. exactly the same as emitting an event except wrapped
 * @param {string} id item id
 * @returns {object} item data
 */
module.exports.item = function(id) {
	const d = {};
	emit('travelers', 'getItem', id, d);
	return d;
}