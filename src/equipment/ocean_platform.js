const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

module.exports.canPlaceStructure = function(buildData, player, val) {
	if(buildData.id === 'ocean_platform') {
		if(generateTileAt(buildData.x, buildData.y) === 'w' && !chunks.isObjectHere(buildData.x, buildData.y)) {
			val.set(true);
		} else {
			val.set(false);
			return false;
		}
	} else {// anything that's not an ocean platform can be placed on an ocean platform
		if(val.get() === false && chunks.isObjectHere(buildData.x, buildData.y) && chunks.getObject(buildData.x, buildData.y).private.structureId === 'ocean_platform') {
			val.set(true);
		}
	}
}