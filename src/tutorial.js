const { chunks } = require('./bullet');

module.exports.tutInc = function(packet, player) {
	if(player.public.tut !== undefined) {
		player.public.tut++;
		if(player.public.tut >= 9) {
			delete player.public.tut;
			player.temp.tut = -1;
			player.addPropToQueue('tut');
		} else player.addPropToQueue('tut');
	}
}

module.exports.tutSkip = function(packet, player) {
	delete player.public.tut;
	player.temp.tut = -1;
	player.addPropToQueue('tut');
}

module.exports.playerCreate = function(player) {
	player.public.tut = 0;
}

module.exports.loot_next = function(packet, player) {
	const {x, y} = player.public;
	const obj = chunks.getObject(x, y);
	if(obj && obj.private && obj.private.eventData && obj.private.eventData.type === 'backpack' && obj.private.eventData.loot)
	{
		let itemCount = 0;
		for(const key in obj.private.eventData.loot) {
			const loot = obj.private.eventData.loot[key];
			for(const item in loot)
			{
				if(loot[item])
				{
					itemCount += loot[item];
				}
			}
		}
		if(itemCount === 0)
		{
			chunks.removeObject(x, y);
		}
	}
}