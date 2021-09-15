const { chunks, players, util, emit } = require('../bullet');

const MAX_DISTANCE = 30;

function distanceTo(pos1, pos2) {
	return Math.max(Math.abs(Math.max(pos1.x, pos2.x)-Math.min(pos1.x, pos2.x)),Math.max(Math.abs(Math.max(pos1.y, pos2.y)-Math.min(pos1.y, pos2.y))));
}

module.exports.scan = function(player) {
	const {x: chunkX, y: chunkY} = chunks.toChunkCoords(player.public.x, player.public.y);
	let minDist = Infinity;
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
								minDist = distance;
							}
						}
					}
				}
			}
		}
	}
	if(minDist <= 30) {
		if(minDist === 0) {
			emit('travelers', 'eventLog', 'the device emits a single, smooth tone that lasts for several seconds, then falls silent.', player);
		} else if(minDist <= 10) {
			emit('travelers', 'eventLog', 'the device beeps very loudly, and with urgency.', player);
		} else if(minDist <= 20) {
			emit('travelers', 'eventLog', 'the device beeps loudly.', player);
		} else {
			emit('travelers', 'eventLog', 'the device beeps softly.', player);
		}
	} else {
		emit('travelers', 'eventLog', 'the device stays silent.', player);
	}
}