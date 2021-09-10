const { chunks, emit } = require("./bullet");
const { placeEvent } = require('./events');

module.exports.drop = function(packet, player) {
	if(packet.option === 'drop') {
		const {x , y} = player.public;
		if(!chunks.isObjectHere(x, y)) {
			placeEvent(x, y, 'n', 'dropped_items', 'dropped_items');
			emit('travelers', 'movePlayerToEvent', player);
		}
	}
}

module.exports.loot_next = function(packet, player) {
	const {x, y} = player.public;
	const obj = chunks.getObject(x, y);
	if(obj && obj.private && obj.private.eventData && obj.private.eventData.type === 'dropped_items' && obj.private.eventData.loot && obj.private.eventData.loot.main)
	{
		const loot = obj.private.eventData.loot.main;
		let itemCount = 0;
		for(const item in loot)
		{
			if(loot[item])
			{
				itemCount += loot[item];
			}
		}
		if(itemCount === 0)
		{
			chunks.removeObject(x, y);
		}
	}
}

emit('travelers', 'addExpiry', 'dropped_items', 60 * 60 * 24 * 5 * 0);