const BASE_PRIORITY = 0;
const thetravelers = require('./bullet');
const { placeEvent, addEventTile } = require('./events');

const plugin = thetravelers.makePlugin('the travelers plus');
// admin utilities
require('./supplies').admin(plugin);
require('./stats').admin(plugin);

// movement
plugin.on('actions::setDir', require('./movement').setDir, BASE_PRIORITY);
plugin.on('travelers::movePlayer', require('./movement').move, BASE_PRIORITY);
plugin.on('travelers::stopPlayerMovement', require('./movement').stopPlayerMovement, BASE_PRIORITY);
plugin.on('playerTick', require('./movement').tick, BASE_PRIORITY);
plugin.on('playerReady', require('./movement').join, BASE_PRIORITY);
plugin.on('actions::doublestep', require('./movement').doubleStep, BASE_PRIORITY);
// stats
plugin.on('playerCreate', require('./stats').playerCreate, BASE_PRIORITY);
plugin.on('playerConnect', require('./stats').playerJoin, BASE_PRIORITY);
plugin.on('playerTick', require('./stats').tick, BASE_PRIORITY - 10);// this is bellow base priority to ensure object additions are applied first
plugin.on('actions::skill_upgrade', require('./stats').skill_upgrade, BASE_PRIORITY);
plugin.on('travelers::movePlayer', require('./stats').movePlayer, BASE_PRIORITY + 10);
plugin.on('travelers::levelUpPlayer', require('./stats').levelUp, BASE_PRIORITY);
plugin.on('travelers::calcWeight', require('./stats').calcWeight, BASE_PRIORITY);
// events
plugin.on('travelers::movePlayer', require('./events').movePlayer, BASE_PRIORITY - 10);
plugin.on('travelers::calcPlayerEvent', require('./events').calcPlayerEvent, BASE_PRIORITY);
plugin.on('travelers::movePlayerToEvent', require('./events').movePlayerToEvent, BASE_PRIORITY);
plugin.on('travelers::addEvent', require('./events').addEvent, BASE_PRIORITY);
plugin.on('travelers::addEvent', require('./events').onAddEvent, BASE_PRIORITY - 10);
plugin.on('travelers::addEventTile', require('./events').addEventTile, BASE_PRIORITY);
plugin.on('travelers::generateLoot', require('./events').generateLoot, BASE_PRIORITY);
plugin.on('actions::loot_next', require('./events').loot_next, BASE_PRIORITY);
plugin.on('actions::loot_exchange', require('./events').loot_exchange, BASE_PRIORITY);
plugin.on('actions::loot_takeall', require('./events').loot_all, BASE_PRIORITY);
plugin.on('actions::event_choice', require('./events').event_choice, BASE_PRIORITY);
plugin.on('actions::reenter', require('./events').reEnter, BASE_PRIORITY);
plugin.on('playerConnect', require('./events').loadPlayer, BASE_PRIORITY + 10);
plugin.on('playerSave', require('./events').savePlayer, BASE_PRIORITY);
plugin.on('playerReady', require('./events').playerJoin, BASE_PRIORITY);
plugin.on('playerCreate', require('./events').playerCreate, BASE_PRIORITY) ;
plugin.on('saveChunk', require('./events').saveChunk, BASE_PRIORITY);
plugin.on('loadChunk', require('./events').loadChunk, BASE_PRIORITY);
// supplies
plugin.on('travelers::getItem', require('./supplies').getItem, BASE_PRIORITY);
plugin.on('travelers::addGameItem', require('./supplies').addGameItem, BASE_PRIORITY);
plugin.on('travelers::addGameItems', require('./supplies').addGameItems, BASE_PRIORITY);
plugin.on('travelers::renderItems', require('./supplies').renderItems, BASE_PRIORITY);
plugin.on('travelers::givePlayerItem', require('./supplies').givePlayerItem, BASE_PRIORITY);
plugin.on('travelers::takePlayerItem', require('./supplies').takePlayerItem, BASE_PRIORITY);
plugin.on('travelers::removeItem', require('./supplies').removeItem, BASE_PRIORITY);
plugin.on('travelers::addItem', require('./supplies').addItem, BASE_PRIORITY);
plugin.on('playerConnect', require('./supplies').playerJoin, BASE_PRIORITY + 10);// apply first so other stuff can check levels
// crafting
plugin.on('travelers::addCraftableItem', require('./crafting').addUnlockLevel, BASE_PRIORITY);
plugin.on('travelers::levelUpPlayer', require('./crafting').connect, BASE_PRIORITY);
plugin.on('travelers::unlockCraftingForPlayer', require('./crafting').unlockCrafting, BASE_PRIORITY);
plugin.on('travelers::renderCrafting', require('./crafting').connect, BASE_PRIORITY);
plugin.on('playerConnect', require('./crafting').connect, BASE_PRIORITY);
plugin.on('playerTick', require('./crafting').tick, BASE_PRIORITY);
plugin.on('actions::craft', require('./crafting').craft, BASE_PRIORITY);
plugin.on('actions::craft_cancelall', require('./crafting').cancelAll, BASE_PRIORITY);
plugin.on('actions::craft_cancelone', require('./crafting').cancelOne, BASE_PRIORITY);
plugin.on('actions::learn', require('./crafting').learn, BASE_PRIORITY);
// equipment
plugin.on('actions::equip', require('./equipment').equip, BASE_PRIORITY);
plugin.on('actions::dequip', require('./equipment').dequip, BASE_PRIORITY);
plugin.on('actions::equipment', require('./equipment').equipment, BASE_PRIORITY);
plugin.on('equip_actions::high_teleporter::north', require('./equipment').north, BASE_PRIORITY);
plugin.on('equip_actions::high_teleporter::east', require('./equipment').east, BASE_PRIORITY);
plugin.on('equip_actions::high_teleporter::south', require('./equipment').south, BASE_PRIORITY);
plugin.on('equip_actions::high_teleporter::west', require('./equipment').west, BASE_PRIORITY);
plugin.on('equip_actions::shovel::dig', require('./equipment').dig, BASE_PRIORITY);
plugin.on('equip_actions::nuke::detonate', require('./equipment').detonate, BASE_PRIORITY);
// base
plugin.on('playerReady', require('./base').join, BASE_PRIORITY);
plugin.on('playerCreate', require('./base').create, BASE_PRIORITY);
// chunks
plugin.on('playerConnect', require('./chunks').tick, BASE_PRIORITY);
plugin.on('playerTick', require('./chunks').tick, BASE_PRIORITY - 10);
plugin.on('chunkSave', require('./chunks').save, BASE_PRIORITY);
plugin.on('gameTickPre', require('./chunks').gameTickPre, BASE_PRIORITY);
plugin.on('loadChunk', require('./chunks').chunkLoad, BASE_PRIORITY);
plugin.on('saveChunk', require('./chunks').chunkUnload, BASE_PRIORITY);

// loading data
thetravelers.emit('travelers', 'addGameItems', require('./itemData.json'));
require('./events/houses.json').forEach(e=>thetravelers.emit('travelers', 'addEvent', 'house', require('./events/houses/' + e)));
require('./events/cites.json').forEach(e=>thetravelers.emit('travelers', 'addEvent', 'city', require('./events/cities/' + e)));
thetravelers.emit('travelers', 'addEvent', 'body', require('./events/other/body.json'));
thetravelers.emit('travelers', 'addEvent', 'crater', require('./events/other/crater.json'));
thetravelers.emit('travelers', 'addEvent', 'hole', require('./events/other/hole.json'));
(function(){// load recipe level unlocks
	const data = require('./craftingData.json');
	for(const key in data)
	{
		for(const item of data[key])
		{
			thetravelers.emit('travelers', 'addCraftableItem', item, Number(key));
		}
	}
})();