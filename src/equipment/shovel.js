const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');
const { placeEvent } = require('../events');

module.exports.dig = function(player) {
	const {x , y} = player.public;
	if(chunks.getObject(x, y))return;
	placeEvent(x, y, 'o', 'hole', 'hole');
}