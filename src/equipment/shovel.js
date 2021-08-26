const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');
const { placeEvent } = require('../events');
const { isValidHole, isMetalHole } = require('../holes');

const METALS = ['scrap_metal', 'steel_shard', 'copper_ore'];
const BONUS_LOOT = [
	{
		name: 'cloth',
		chance: .25,
		min: 1,
		max: 3
	},
	{
		name: 'plastic',
		chance: .05,
		min: 1,
		max: 2
	},
	{
		name: 'bullet',
		chance: .001,
		min: 1,
		max: 1
	}]

module.exports.dig = function(player) {
	const {x , y} = player.public;
	const obj = chunks.getObject(x, y);
	if(obj)
	{
		if(obj.public.char !== 'o')return;
		else obj.private.visible = undefined;
	}
	else {
		placeEvent(x, y, 'o', 'hole', 'hole');
		if(isMetalHole(x, y)) {
			const lootFull = chunks.getObject(x, y).private.eventData.loot;
			lootFull.main = {};
			const loot = lootFull.main;
			const metal = METALS[Math.floor(Math.random() * METALS.length)];
			const metalCount = Math.floor(Math.random() * (3) + 2);
			let bonus, bonusCount;
			for(const bonusLoot of BONUS_LOOT) {
				if(Math.random() < bonusLoot.chance) {
					bonus = bonusLoot.name;
					bonusCount = Math.floor(Math.random() * (bonusLoot.max - bonusLoot.min) + bonusLoot.min);
					break;
				}
			}
			loot[metal] = metalCount;
			if(bonus) {
				loot[bonus] = bonusCount;
			}
		}
	}
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