const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

const TP_DISTANCE = 10;
const ITEM_COUNT = 1;
const ITEM_ID = 'battery';

/**
 * @param {players.player} player 
 */
 module.exports.north = function(player) {
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT)return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.y += TP_DISTANCE;
	player.addPropToQueue('y');
}

/**
 * @param {players.player} player 
 */
 module.exports.south = function(player) {
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT)return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.y -= TP_DISTANCE;
	player.addPropToQueue('y');
}

/**
 * @param {players.player} player 
 */
 module.exports.east = function(player) {
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT)return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.x += TP_DISTANCE;
	player.addPropToQueue('x');
}

/**
 * @param {players.player} player 
 */
 module.exports.west = function(player) {
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT)return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.x -= TP_DISTANCE;
	player.addPropToQueue('x');
}