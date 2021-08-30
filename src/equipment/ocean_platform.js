const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

module.exports.canPlaceStructure = function(buildData, player, val) {
	if(buildData.id === 'ocean_platform') {
		if(generateTileAt(buildData.x, buildData.y) === 'w') {
			val.set(true);
		} else {
			val.set(false);
			return false;
		}
	}
}