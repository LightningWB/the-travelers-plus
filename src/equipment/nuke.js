const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');
const { placeEvent } = require('../events');

module.exports.detonate = function(player) {
	const {x , y} = player.public;
	if(chunks.getObject(x, y))return;
	placeEvent(x, y, 'O', 'crater', 'crater');
	// 2 above
	placeEvent(x, y + 2, '▓');
	// 1 above
	placeEvent(x - 1, y + 1, '▓');
	placeEvent(x, y + 1, '▓');
	placeEvent(x + 1, y + 1, '▓');
	// level
	placeEvent(x - 2, y, '▓');
	placeEvent(x - 1, y, '▓');
	placeEvent(x + 1, y, '▓');
	placeEvent(x + 2, y, '▓');
	// 1 down
	placeEvent(x - 1, y - 1, '▓');
	placeEvent(x, y - 1, '▓');
	placeEvent(x + 1, y - 1, '▓');
	// 2 down
	placeEvent(x, y - 2, '▓');
}