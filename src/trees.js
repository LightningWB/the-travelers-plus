const { config } = require('.');
const {players, generateTileAt, chunks, emit, util, options} = require('./bullet');
const { giveItemToPlayer, renderItems } = require('./supplies');

let currentTime = 0;
const RESET_INTERVAL = config.stump_clear_time * Math.ceil(options.tps);

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.gettree = function(packet, player) {
	const {x, y} = player.public;
	const {x: chunkX, y: chunkY} = chunks.toChunkCoords(x, y);
	const chunk = chunks.getChunkFromChunkCoords(chunkX, chunkY);
	if(chunk.meta.stumps === undefined)chunk.meta.stumps = [];
	const stumps = chunk.meta.stumps;
	if(generateTileAt(x, y) === 't' && stumps.find(stump => stump.x === x && stump.y === y) === undefined) {
		stumps.push({x: x, y: y});
		giveItemToPlayer('wood_stick', 1, player);
		emit('travelers', 'renderItems', player);
	}
}

module.exports.break = function(packet, player) {
	const {x, y} = util.compassChange(player.public.x, player.public.y, packet.dir, 1);
	const {x: chunkX, y: chunkY} = chunks.toChunkCoords(x, y);
	const chunk = chunks.getChunkFromChunkCoords(chunkX, chunkY);
	if(chunk.meta.stumps === undefined)chunk.meta.stumps = [];
	const stumps = chunk.meta.stumps;
	if(generateTileAt(x, y) === 't' && stumps.find(stump => stump.x === x && stump.y === y) === undefined) {
		stumps.push({x: x, y: y});
		giveItemToPlayer('wood_stick', 1, player);
		emit('travelers', 'renderItems', player);
	}
}

module.exports.unloadChunk = function(chunk) {
	if(chunk.meta.stumps)delete chunk.meta.stumps;
}

module.exports.chunkLoad = function(chunk) {
	chunk.meta.stumps = [];
}

module.exports.playerTick = function(player) {
	if(player.public.state === 'death') {
		return;
	}
	const {x: chunkX, y: chunkY} = chunks.toChunkCoords(player.public.x, player.public.y);
	const meX = player.public.x;
	const meY = player.public.y;
	const stumps = [];
	for(let x = chunkX - 1; x <= chunkX + 1; x++)
	{
		for(let y = chunkY - 1; y <= chunkY + 1; y++)
		{
			// player chunk lists
			const chunk = chunks.getChunkFromChunkCoords(x, y);
			if(chunk && chunk.meta && chunk.meta.stumps) for(const stump of chunk.meta.stumps)
			{
				if(
					(stump.x > meX - 16 && stump.x < meX + 16) &&// x values
					(stump.y > meY - 16 && stump.y < meY + 16)// y values
				){
					stumps.push({x: stump.x, y: stump.y});
				}
			}
		}
	}
	if(stumps.length > 0)
	{
		if(player.temp.proximity === undefined) {
			player.temp.proximity = {};
		}
		player.temp.proximity.stumps = stumps;
		player.addPropToQueue('proximity');
	}
}

module.exports.tick = function() {
	currentTime++;
	if(currentTime % RESET_INTERVAL == 0) {// reset stumps
		for(const chunkId of chunks.getLoadedChunks()) {
			const x = parseInt(chunkId.split('|')[0]);
			const y = parseInt(chunkId.split('|')[1]);
			const chunk = chunks.getChunkFromChunkCoords(x, y);
			if(chunk) {// I think if a chunks get saved and this happens in the same cycle, chunk can be undefined
				chunk.meta.stumps = [];
			}
		}
	}
}