const { chunks, players, util, emit } = require('../bullet');

const MAX_DISTANCE = 100;

function distanceTo(pos1, pos2) {
	return Math.max(Math.abs(Math.max(pos1.x, pos2.x)-Math.min(pos1.x, pos2.x)),Math.max(Math.abs(Math.max(pos1.y, pos2.y)-Math.min(pos1.y, pos2.y))));
}

module.exports.scan = function(player) {
	const {x: chunkX, y: chunkY} = chunks.toChunkCoords(player.public.x, player.public.y);
	let minDist = Infinity;
	let closestPlayer = null;
	for(let x = chunkX - 1; x <= chunkX + 1; x++)
	{
		for(let y = chunkY - 1; y <= chunkY + 1; y++)
		{
			const chunk = chunks.getChunkFromChunkCoords(x, y);
			if(chunk) {
				for(const name of chunk.meta.players) {
					if(name !== player.public.username) {
						const user = players.getPlayerByUsername(name);
						const distance = distanceTo(player.public, user.public);
						if(distance < minDist && distance <= MAX_DISTANCE && user.public.state !== 'death') {
							const out = util.out(true, 'boolean');
							emit('travelers', 'canScanPlayer', player, user, out);
							if(out.get()) {
								closestPlayer = players.getPlayerByUsername(name);
								minDist = distance;
							}
						}
					}
				}
			}
		}
	}
	if(closestPlayer !== null) {
		// compute direction
		let direction = '';
		const dx = closestPlayer.public.x - player.public.x;
		const dy = closestPlayer.public.y - player.public.y;
		if(dy > 0) {
			direction += 'north';
		} else if(dy < 0) {
			direction += 'south';
		}
		if(dx > 0) {
			direction += 'east';
		} else if(dx < 0) {
			direction += 'west';
		}
		// send it to client
		if(direction === '') {
			emit('travelers', 'eventLog', 'the scanner blinks green, and the arrow spins quickly in a circle.', player);
		} else {
			emit('travelers', 'eventLog', 'the scanner blinks green, and the arrow swivels to point ' + direction + '.', player);
		}
	} else {
		emit('travelers', 'eventLog', 'the red light on the scanner blinks, indicating no one was found.', player);
	
	}
}