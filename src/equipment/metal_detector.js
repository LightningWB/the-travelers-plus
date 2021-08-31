const {emit} = require('../bullet');
const { isMetalHole } = require('../holes');
const {dig, recentMetals} = require('./shovel');
module.exports.dig_with_shovel = function(player) {
	if(player.private.supplies.shovel && player.private.supplies.shovel > 0) {
		dig(player);
	}
}

module.exports.onPlayerStep = function(player, _val) {
	if(player.public.equipped === 'metal_detector' && player.cache.travelData.dir !== '' && recentMetals.find(o => o.x === player.public.x && o.y === player.public.y) === undefined) {
		if(isMetalHole(player.public.x, player.public.y)) {
			emit('travelers', 'eventLog', 'the metal detector pings. (' + player.public.x + ', ' + player.public.y + ')', player);
		}
	}
}