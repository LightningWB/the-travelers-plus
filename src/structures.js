const config = require('./').config;
const bullet = require('./bullet');
const tps = bullet.options.tps;

const items = require('./supplies').getItems();
items.wood_block.break_time = Math.ceil(config.wood_break_time * tps);
items.scrap_block.break_time = Math.ceil(config.scrap_break_time * tps);
items.steel_block.break_time = Math.ceil(config.steel_break_time * tps);
items.wood_door.break_time = Math.ceil(config.wood_break_time * tps);
items.scrap_door.break_time = Math.ceil(config.scrap_break_time * tps);
items.steel_door.break_time = Math.ceil(config.steel_break_time * tps);
items.reality_anchor.break_time = Math.ceil(config.wood_break_time * (2/3) * tps);

module.exports = [
	{
		"id": "wood_block",
		"placingItem": "wood_block",
		"char": "+",
		"isBreakable": true,
		"breakTime": Math.ceil(config.wood_break_time * tps),
		"walkOver": false
	},
	{
		"id": "scrap_block",
		"placingItem": "scrap_block",
		"char": "#",
		"isBreakable": true,
		"breakTime": Math.ceil(config.scrap_break_time * tps),
		"walkOver": false
	},
	{
		"id": "steel_block",
		"placingItem": "steel_block",
		"char": "<b>#</b>",
		"isBreakable": true,
		"breakTime": Math.ceil(config.steel_break_time * tps),
		"walkOver": false
	},
	{
		"id": "wood_door",
		"placingItem": "wood_door",
		"char": "D",
		"isBreakable": true,
		"breakTime": Math.ceil(config.wood_break_time * tps),
		"isDoor": true
	},
	{
		"id": "scrap_door",
		"placingItem": "scrap_door",
		"char": "<b>D</b>",
		"isBreakable": true,
		"breakTime": Math.ceil(config.scrap_break_time * tps),
		"isDoor": true
	},
	{
		"id": "steel_door",
		"placingItem": "steel_door",
		"char": "$",
		"isBreakable": true,
		"breakTime": Math.ceil(config.steel_break_time * tps),
		"isDoor": true
	},
	{
		"id": "reality_anchor",
		"placingItem": "reality_anchor",
		"char": "┬",
		"isBreakable": true,
		"breakTime": Math.ceil(config.wood_break_time * (2/3) * tps),
		"walkOver": false
	},
	{
		"id": "small_chest",
		"placingItem": "small_chest",
		"char": "◻",
		"isBreakable": true,
		"breakTime": 300,
		"eventId": "smallBox",
		"eventType": "storageUnit"
	},
	{
		"id": "large_chest",
		"placingItem": "large_chest",
		"char": "▭",
		"isBreakable": true,
		"breakTime": 600,
		"eventId": "largeBox",
		"eventType": "storageUnit"
	},
	{
		"id": "sign_block",
		"placingItem": "sign_block",
		"char": "¶",
		"isBreakable": true,
		"breakTime": 180,
		"eventId": "sign",
		"eventType": "sign"
	},
	{
		"id": "ocean_platform",
		"placingItem": "ocean_platform",
		"char": "Θ",
		"isBreakable": true,
		"breakTime": 10
	},
	{
		"id": "airwave_tower",
		"placingItem": "airwave_tower",
		"char": "ƛ",
		"isBreakable": true,
		"breakTime": 1800,
		"walkOver": false
	}
]