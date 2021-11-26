const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

const TP_DISTANCE = 4000;
const ITEM_COUNT = 5;
const ITEM_ID = 'charged_core';

const isRadioTowerNearby = (loc) => util.findObjectsInRadius(loc, 10, obj => obj.private.structureId === 'airwave_tower').length > 0;

/**
 * @param {players.player} player 
 */
 module.exports.north = async function(player) {
	const targetLoc = {x: player.public.x, y: player.public.y + TP_DISTANCE};
	await chunks.loadChunk(targetLoc.x, targetLoc.y);
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT || isRadioTowerNearby(player.public) || isRadioTowerNearby(targetLoc))return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.y += TP_DISTANCE;
	player.addPropToQueue('y');
}

/**
 * @param {players.player} player 
 */
 module.exports.south = async function(player) {
	const targetLoc = {x: player.public.x, y: player.public.y - TP_DISTANCE};
	await chunks.loadChunk(targetLoc.x, targetLoc.y);
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT || isRadioTowerNearby(player.public) || isRadioTowerNearby(targetLoc))return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.y -= TP_DISTANCE;
	player.addPropToQueue('y');
}

/**
 * @param {players.player} player 
 */
 module.exports.east = async function(player) {
	const targetLoc = {x: player.public.x + TP_DISTANCE, y: player.public.y};
	await chunks.loadChunk(targetLoc.x, targetLoc.y);
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT || isRadioTowerNearby(player.public) || isRadioTowerNearby(targetLoc))return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.x += TP_DISTANCE;
	player.addPropToQueue('x');
}

/**
 * @param {players.player} player 
 */
 module.exports.west = async function(player) {
	const targetLoc = {x: player.public.x - TP_DISTANCE, y: player.public.y};
	await chunks.loadChunk(targetLoc.x, targetLoc.y);
	if(!player.private.supplies[ITEM_ID] || player.private.supplies[ITEM_ID] < ITEM_COUNT || isRadioTowerNearby(player.public) || isRadioTowerNearby(targetLoc))return;
	player.private.supplies[ITEM_ID] -= ITEM_COUNT;
	emit('travelers', 'renderItems', player);
	emit('travelers', 'calcWeight', player);
	player.public.x -= TP_DISTANCE;
	player.addPropToQueue('x');
}