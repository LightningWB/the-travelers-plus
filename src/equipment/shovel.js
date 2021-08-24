const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');
const { placeEvent } = require('../events');
const { isValidHole } = require('../holes');

module.exports.dig = function(player) {
	const {x , y} = player.public;
	const obj = chunks.getObject(x, y);
	if(obj)
	{
		if(obj.public.char !== 'o')return;
		else obj.private.visible = undefined;
	}
	else placeEvent(x, y, 'o', 'hole', 'hole');
	emit('travelers', 'movePlayerToEvent', player);
}

module.exports.fill = function(player) {
	const {x , y} = player.public;
	const obj = chunks.getObject(x, y);
	if(!obj)return;
	if(obj.private && obj.private.eventData && obj.private.eventData.type === 'hole' && obj.private.visible !== false)
	{
		obj.private.visible = false;
	}
}

module.exports.loot_next = function(packet, player) {
	const {x, y} = player.public;
	const obj = chunks.getObject(x, y);
	if(obj.private && obj.private.eventData && obj.private.eventData.type === 'hole' && obj.private.eventData.loot && obj.private.eventData.loot.main)
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