const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');
const { addEventTile, placeEvent } = require('./events');
const { item } = require('./supplies');

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.equip = function(packet, player) {
	if(player.public.state === 'travel')
	{
		if(typeof packet.item === 'string')
		{
			const i = item(packet.item);
			if(i && i.func && player.private.supplies[packet.item] &&
			player.private.supplies[packet.item] > 0)
			{
				player.public.equipped = packet.item;
				player.addPropToQueue('equipped');
			}
		}
	}
}

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.equipment = function(packet, player) {
	if(
		player.public.state === 'travel' &&
		player.public.equipped &&
		item(player.public.equipped).func_actions[packet.option] &&
		player.private.supplies[player.public.equipped] &&
		player.private.supplies[player.public.equipped] > 0
	){
		emit('equip_actions', player.public.equipped + '::' + packet.option, player);
	}
}

/**
 * @param {players.player} player 
 */
module.exports.north = function(player) {
	if(!player.private.supplies.charged_core || player.private.supplies.charged_core < 6)return;
	player.private.supplies.charged_core -= 5;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.y += 10000;
	player.addPropToQueue('y');
}

/**
 * @param {players.player} player 
 */
 module.exports.south = function(player) {
	if(!player.private.supplies.charged_core || player.private.supplies.charged_core < 6)return;
	player.private.supplies.charged_core -= 5;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.y -= 10000;
	player.addPropToQueue('y');
}

/**
 * @param {players.player} player 
 */
 module.exports.east = function(player) {
	if(!player.private.supplies.charged_core || player.private.supplies.charged_core < 6)return;
	player.private.supplies.charged_core -= 5;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.x += 10000;
	player.addPropToQueue('x');
}

/**
 * @param {players.player} player 
 */
 module.exports.west = function(player) {
	if(!player.private.supplies.charged_core || player.private.supplies.charged_core < 6)return;
	player.private.supplies.charged_core -= 5;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.x -= 10000;
	player.addPropToQueue('x');
}

module.exports.dig = function(player) {
	const {x , y} = player.public;
	if(chunks.getObject(x, y))return;
	placeEvent(x, y, 'o', 'hole', 'hole');
}

module.exports.detonate = function(player) {
	const {x , y} = player.public;
	if(chunks.getObject(x, y))return;
	placeEvent(x, y, 'O', 'crater', 'crater');
	// 2 above
	placeEvent(x, y + 2, '▓');
	// 1 above
	placeEvent(x - 1, y + 1, '▓');
	placeEvent(x, y + 1, '▓');
	placeEvent(x + 1, y + 1, '▓');
	// level
	placeEvent(x - 2, y, '▓');
	placeEvent(x - 1, y, '▓');
	placeEvent(x + 1, y, '▓');
	placeEvent(x + 2, y, '▓');
	// 1 down
	placeEvent(x - 1, y - 1, '▓');
	placeEvent(x, y - 1, '▓');
	placeEvent(x + 1, y - 1, '▓');
	// 2 down
	placeEvent(x, y - 2, '▓');
}