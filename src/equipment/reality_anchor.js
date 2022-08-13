const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

const removeRespawn = (loc) => {
	if(!chunks.isChunkLoaded(loc.x, loc.y)) {
		chunks.loadChunk(loc.x, loc.y);
	}
	const interval = setInterval(() => {
		if(chunks.isChunkLoaded(loc.x, loc.y)) {
			clearInterval(interval);
			const obj = chunks.getObject(loc.x, loc.y);
			if(obj) {
				delete obj.private.owner;
			}
		}
	}, 10);
}

/**
 * 
 * @param {*} reality_anchor 
 * @param {players.player} player 
 */
module.exports.placed = function(reality_anchor, player) {
  reality_anchor.private.owner = player.private.id;
  if(player.private.respawnPoint) {
	  removeRespawn(player.private.respawnPoint);
  }
  player.private.respawnPoint = { x: reality_anchor.public.x, y: reality_anchor.public.y };
  emit('travelers', 'eventLog', 'successfully anchored life force.', player);
}

module.exports.broke = function(reality_anchor, _player) {
  const owner = players.getPlayer(reality_anchor.private.owner);
  if (owner && owner.private.respawnPoint.x === reality_anchor.public.x && owner.private.respawnPoint.y === reality_anchor.public.y)
  {
    owner.private.respawnPoint = undefined;
  }
}

module.exports.getSpawnLocation = function(player, val) {
	if(player.private.respawnPoint) {
		val.set({x: player.private.respawnPoint.x, y: player.private.respawnPoint.y});
	}
}