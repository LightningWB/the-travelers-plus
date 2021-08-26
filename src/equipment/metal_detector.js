const {emit} = require('../bullet');
const { isMetalHole } = require('../holes');
const dig = require('./shovel').dig;
module.exports.dig_with_shovel = function(player) {
	if(player.private.supplies.shovel && player.private.supplies.shovel > 0) {
		dig(player);
	} else {
		emit('travelers', 'eventLog', 'you don\'t have a shovel.\'', player);
	}
}

module.exports.movePlayer = function(player) {
	if(player.public.equipped === 'metal_detector') {
		if(isMetalHole(player.public.x, player.public.y)) {
			emit('travelers', 'eventLog', 'the metal detector pings. (' + player.public.x + ', ' + player.public.y + ')', player);
		}
	}
}