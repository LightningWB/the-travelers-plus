const { players } = require('../bullet');

function distanceTo(pos1, pos2) {
	return Math.max(Math.abs(Math.max(pos1.x, pos2.x)-Math.min(pos1.x, pos2.x)),Math.max(Math.abs(Math.max(pos1.y, pos2.y)-Math.min(pos1.y, pos2.y))));
}

module.exports.canSee = function(viewer, viewee, out) {
	if(out.get() === true && viewee.public.equipped === 'camo' && distanceTo(viewer.public, viewee.public) > 5 && !players.isPlayerOnline(viewee.public.username)) {
		out.set(false);
	}
}