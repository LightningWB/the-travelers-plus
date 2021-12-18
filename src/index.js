const BASE_PRIORITY = 0;
const thetravelers = require('./bullet');

const plugin = thetravelers.makePlugin('the travelers plus');
// config stuff
const config = plugin.loadConfig({
	header: 'the travelers plus\nhttps://github.com/LightningWB/the-travelers-plus',
	options: {
		hardcore: {
			description: 'Disables respawning.',
			allowed: 'Boolean',
			default: false,
		},
		xp_exponential_rate: {
			description: 'The exponential growth rate for xp required.',
			allowed: 'Number',
			default: 2.75,
		},
		xp_level_increase_rate: {
			description: 'The amount the xp increases per level not including the exponential factor.',
			allowed: 'Number',
			default: 20,
		},
		house_xp_reward: {
			description: 'The amount of xp rewarded for discovering a house.',
			allowed: 'Number',
			default: 25,
		},
		city_xp_reward: {
			description: 'The amount of xp rewarded for discovering a city.',
			allowed: 'Number',
			default: 100,
		},
		stump_clear_time: {
			description: 'How often cut down trees regrow in seconds.',
			allowed: 'Integer',
			default: 3600 * 24
		},
		metal_hole_chance: {
			description: 'The chance of a metal hole being at a particular location.',
			allowed: 'Positive Number',
			default: .3,
		},
		max_metal_holes: {
			description: 'The maximum amount of metal holes that can exist before existing locations can contain metal again.',
			allowed: 'Positive Number',
			default: 5000,
		},
		pvp_enabled: {
			description: 'Whether or not pvp is enabled.',
			allowed: 'Boolean',
			default: true,
		},
		spawn_challenge_radius: {
			description: 'The radius of the spawn area that is challenge only.',
			allowed: 'Number',
			default: 100
		},
		pvp_xp_reward_modifier: {
			description: 'The percentage of xp rewarded for killing a player.',
			allowed: 'Positive Number',
			default: .1,
		},
		pvp_xp_reward_min: {
			description: 'The minimum amount of xp rewarded for killing a player. Set to a negative number to disable.',
			allowed: 'Number',
			default: -1,
		},
		pvp_xp_reward_max: {
			description: 'The maximum amount of xp rewarded for killing a player. Set to a negative number to disable.',
			allowed: 'Number',
			default: -1,
		},
		death_xp_penalty: {
			description: 'The percentage of xp lost when a player dies.',
			allowed: 'Positive Number',
			default: .1,
		}
	}
});
Object.freeze(config);// thou shalt not edit this
module.exports.config = config;
thetravelers.patches.addPatch('XP.getNextLevelXP', '2.75', config.xp_exponential_rate, false);
thetravelers.patches.addPatch('XP.getNextLevelXP', '20', config.xp_level_increase_rate, false);
// storage stuff
const storage = plugin.getStorage();
module.exports.storage = storage;
module.exports.saveStorage = () => plugin.setStorage(storage);

// state checking
require('./checks').registerStates(plugin);
// admin utilities
require('./supplies').admin(plugin);
require('./stats').admin(plugin);

// movement
plugin.on('actions::setDir', require('./movement').setDir, BASE_PRIORITY);
plugin.on('travelers::movePlayer', require('./movement').move, BASE_PRIORITY);
plugin.on('travelers::stopPlayerMovement', require('./movement').stopPlayerMovement, BASE_PRIORITY);
plugin.on('playerTick', require('./movement').tick, BASE_PRIORITY);
plugin.on('playerConnect', require('./movement').join, BASE_PRIORITY);
plugin.on('actions::doublestep', require('./movement').doubleStep, BASE_PRIORITY);
// time
plugin.on('gameTickPre', require('./time').gameTickPre, BASE_PRIORITY + 10);
plugin.on('playerTick', require('./time').playerTick, BASE_PRIORITY);
plugin.on('playerConnect', require('./time').playerJoin, BASE_PRIORITY);
plugin.on('travelers::getTime', require('./time').getTime, BASE_PRIORITY);
plugin.on('travelers::setTime', require('./time').setTime, BASE_PRIORITY);
// stats
plugin.on('playerCreate', require('./stats').playerCreate, BASE_PRIORITY);
plugin.on('playerConnect', require('./stats').playerJoin, BASE_PRIORITY);
plugin.on('playerTick', require('./stats').tick, BASE_PRIORITY - 10);// this is bellow base priority to ensure object additions are applied first
plugin.on('actions::skill_upgrade', require('./stats').skill_upgrade, BASE_PRIORITY);
plugin.on('actions::reset_skills', require('./stats').reset_skills, BASE_PRIORITY);
plugin.on('travelers::movePlayer', require('./stats').movePlayer, BASE_PRIORITY + 10);
plugin.on('travelers::levelUpPlayer', require('./stats').levelUp, BASE_PRIORITY);
plugin.on('travelers::calcWeight', require('./stats').calcWeight, BASE_PRIORITY);
plugin.on('travelers::resetSkills', require('./stats').travelersResetSkills, BASE_PRIORITY);
plugin.on('travelers::resetLevel', require('./stats').resetLevel, BASE_PRIORITY);
plugin.on('travelers::givePlayerXp', require('./stats').givePlayerXp, BASE_PRIORITY);
plugin.on('travelers::onPlayerStep', require('./stats').onStep, BASE_PRIORITY);
// effects
plugin.on('travelers::addGameEffect', require('./fx').addGameEffect, BASE_PRIORITY);
plugin.on('travelers::giveEffect', require('./fx').addEffect, BASE_PRIORITY);
plugin.on('travelers::killPlayer', require('./fx').playerKill, BASE_PRIORITY);
plugin.on('playerTick', require('./fx').playerTick, BASE_PRIORITY);
plugin.on('playerConnect', require('./fx').playerJoin, BASE_PRIORITY);
plugin.on('ready', require('./fx').ready, BASE_PRIORITY);
	// constitution
	plugin.on('travelers::isChallenge', require('./fx').isChallenge, BASE_PRIORITY);
	plugin.on('travelers::playerJoinInteraction', require('./fx').playerJoinInteraction, BASE_PRIORITY + 10);
	// weight
	plugin.on('travelers::getMovementSpeed', require('./fx').getMovementSpeed, BASE_PRIORITY);
// interactions
plugin.on('travelers::battles::end', require('./interactions').battleEnd, BASE_PRIORITY);
plugin.on('travelers::battles::fightOpened', require('./interactions').battleStart, BASE_PRIORITY);
plugin.on('travelers::movePlayer', require('./interactions').movePlayer, BASE_PRIORITY - 10);
plugin.on('travelers::playerJoinInteraction', require('./interactions').playerJoinInteraction, BASE_PRIORITY);
plugin.on('actions::leave_int', require('./interactions').leave_int, BASE_PRIORITY);
plugin.on('actions::chat', require('./interactions').chat, BASE_PRIORITY);// communication
plugin.on('actions::int_leavemsg', require('./interactions').leaveMessage, BASE_PRIORITY);
plugin.on('actions::int_getmsg', require('./interactions').getMessage, BASE_PRIORITY);
plugin.on('actions::int_removemsg', require('./interactions').removeMessage, BASE_PRIORITY);
plugin.on('actions::int_lootoffline', require('./interactions').lootOffline, BASE_PRIORITY);// looting
plugin.on('actions::int_next', require('./interactions').next, BASE_PRIORITY);
plugin.on('actions::int_killoffline', require('./interactions').killOffline, BASE_PRIORITY);
plugin.on('playerReady', require('./interactions').playerReady, BASE_PRIORITY);
plugin.on('playerConnect', require('./interactions').playerConnect, BASE_PRIORITY);
plugin.on('disconnect', require('./interactions').disconnect, BASE_PRIORITY);
plugin.on('playerTick', require('./interactions').playerTick, BASE_PRIORITY);
// events
plugin.on('travelers::getEventHashTable', require('./events').getEventHashTable, BASE_PRIORITY);
plugin.on('travelers::getHashedValue', require('./events').getHashedValue, BASE_PRIORITY);
plugin.on('travelers::onPlayerStep', require('./events').movePlayer, BASE_PRIORITY - 10);
plugin.on('travelers::calcPlayerEvent', require('./events').calcPlayerEvent, BASE_PRIORITY);
plugin.on('travelers::movePlayerToEvent', require('./events').movePlayerToEvent, BASE_PRIORITY);
plugin.on('travelers::addEvent', require('./events').addEvent, BASE_PRIORITY);
plugin.on('travelers::addEvent', require('./events').onAddEvent, BASE_PRIORITY - 10);
plugin.on('travelers::addEventTile', require('./events').addEventTile, BASE_PRIORITY);
plugin.on('travelers::generateLoot', require('./events').generateLoot, BASE_PRIORITY);
plugin.on('travelers::setReward', require('./events').setReward, BASE_PRIORITY);
plugin.on('travelers::getRewards', require('./events').getRewards, BASE_PRIORITY);
plugin.on('travelers::addExpiry', require('./events').addExpiry, BASE_PRIORITY);
plugin.on('actions::loot_next', require('./events').loot_next, BASE_PRIORITY);
plugin.on('actions::loot_exchange', require('./events').loot_exchange, BASE_PRIORITY);
plugin.on('actions::int_exchange', require('./events').int_exchange, BASE_PRIORITY);
plugin.on('actions::loot_takeall', require('./events').loot_all, BASE_PRIORITY);
plugin.on('actions::int_takeall', require('./events').int_takeall, BASE_PRIORITY);
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
// building
plugin.on('travelers::addStructureData', require('./building').addStructure, BASE_PRIORITY);
plugin.on('travelers::movePlayer', require('./building').cancelBreak, BASE_PRIORITY - 10);
plugin.on('travelers::placeStructure', require('./building').placeStructure, BASE_PRIORITY);
plugin.on('travelers::breakStructure', require('./building').breakStructure, BASE_PRIORITY);
plugin.on('travelers::canPlayerMoveOn', require('./building').canPlayerMoveOn, BASE_PRIORITY);
plugin.on('actions::build', require('./building').build, BASE_PRIORITY);
plugin.on('actions::break', require('./building').break, BASE_PRIORITY);
plugin.on('actions::cancel_break', require('./building').cancel_break, BASE_PRIORITY);
plugin.on('playerConnect', require('./building').playerConnect, BASE_PRIORITY);
plugin.on('playerTick', require('./building').tick, BASE_PRIORITY + 10);// apply first so other stuff can see structures
plugin.on('loadChunk', require('./building').chunkLoad, BASE_PRIORITY);
plugin.on('saveChunk', require('./building').chunkUnload, BASE_PRIORITY);
// combat
plugin.on('actions::pvp-attack', require('./pvp').attack, BASE_PRIORITY);
plugin.on('actions::int_acceptchal', require('./pvp').acceptChallenge, BASE_PRIORITY);
plugin.on('actions::pvp-endchat', require('./pvp').endChat, BASE_PRIORITY);
plugin.on('actions::pvp-startready', require('./pvp').startReady, BASE_PRIORITY);
plugin.on('actions::pvp-execute', require('./pvp').execute, BASE_PRIORITY);
plugin.on('actions::pvp-battleopt', require('./pvp').battleOpt, BASE_PRIORITY);
plugin.on('actions::leave_int', require('./pvp').leaveInt, BASE_PRIORITY - 10);
plugin.on('gameTick', require('./pvp').tick, BASE_PRIORITY);
plugin.on('ready', require('./pvp').onReady, BASE_PRIORITY);
plugin.on('travelers::battles::playerWon', require('./pvp').playerWon, BASE_PRIORITY);
// equipment
plugin.on('actions::equip', require('./equipment').equip, BASE_PRIORITY);
plugin.on('actions::dequip', require('./equipment').dequip, BASE_PRIORITY);
plugin.on('actions::equipment', require('./equipment').equipment, BASE_PRIORITY);
// equipment
	// high teleporter
	plugin.on('equip_actions::high_teleporter::north', require('./equipment/high_teleporter').north, BASE_PRIORITY);
	plugin.on('equip_actions::high_teleporter::east', require('./equipment/high_teleporter').east, BASE_PRIORITY);
	plugin.on('equip_actions::high_teleporter::south', require('./equipment/high_teleporter').south, BASE_PRIORITY);
	plugin.on('equip_actions::high_teleporter::west', require('./equipment/high_teleporter').west, BASE_PRIORITY);
	// low teleporter
	plugin.on('equip_actions::low_teleporter::north', require('./equipment/low_teleporter').north, BASE_PRIORITY);
	plugin.on('equip_actions::low_teleporter::east', require('./equipment/low_teleporter').east, BASE_PRIORITY);
	plugin.on('equip_actions::low_teleporter::south', require('./equipment/low_teleporter').south, BASE_PRIORITY);
	plugin.on('equip_actions::low_teleporter::west', require('./equipment/low_teleporter').west, BASE_PRIORITY);
	// high scanner
	plugin.on('equip_actions::player_scanner_highrange::scan', require('./equipment/player_scanner_highrange').scan, BASE_PRIORITY);
	// low scanner
	plugin.on('equip_actions::player_scanner::scan', require('./equipment/player_scanner').scan, BASE_PRIORITY);
	// heat mask
	plugin.on('travelers::canScanPlayer', require('./equipment/heat_masker').canScan, BASE_PRIORITY);
	// shovel
	plugin.on('equip_actions::shovel::dig', require('./equipment/shovel').dig, BASE_PRIORITY);
	plugin.on('equip_actions::shovel::fill', require('./equipment/shovel').fill, BASE_PRIORITY);
	plugin.on('actions::loot_next', require('./equipment/shovel').loot_next, BASE_PRIORITY - 10);
	plugin.on('saveChunk', require('./holes').unloadChunk, BASE_PRIORITY + 10);
	// metal detector
	plugin.on('equip_actions::metal_detector::dig_with_shovel', require('./equipment/metal_detector').dig_with_shovel, BASE_PRIORITY);
	plugin.on('travelers::onPlayerStep', require('./equipment/metal_detector').onPlayerStep, BASE_PRIORITY);
	// radio
	plugin.on('playerConnect', require('./equipment/radio').connect, BASE_PRIORITY);
	plugin.on('travelers::radioBroadcast', require('./equipment/radio').radioBroadcast, BASE_PRIORITY);
	plugin.on('equip_actions::radio::radio_toggle', require('./equipment/radio').radio_toggle, BASE_PRIORITY);
	plugin.on('equip_actions::radio::radio_transmit', require('./equipment/radio').radio_transmit, BASE_PRIORITY);
	plugin.on('equip_actions::radio::radio_setchannel', require('./equipment/radio').radio_setchannel, BASE_PRIORITY);
	// boat
	plugin.on('travelers::canPlayerMoveOnTile', require('./equipment/boat').canPlayerMoveOnTile, BASE_PRIORITY);
	plugin.on('actions::dequip', require('./equipment/boat').unequip, BASE_PRIORITY + 10);
	// nuke
	plugin.on('equip_actions::nuke::detonate', require('./equipment/nuke').detonate, BASE_PRIORITY);
	// reality anchor
	plugin.on('travelers::structurePlaced::reality_anchor', require('./equipment/reality_anchor').placed, BASE_PRIORITY);
	plugin.on('travelers::structureBroke::reality_anchor', require('./equipment/reality_anchor').broke, BASE_PRIORITY);
	plugin.on('travelers::getSpawnLocation', require('./equipment/reality_anchor').getSpawnLocation, BASE_PRIORITY);
	// signs
	plugin.on('travelers::calcPlayerEvent', require('./equipment/sign_block').calcPlayerEvent, BASE_PRIORITY - 10);
	plugin.on('travelers::structurePlaced::sign_block', require('./equipment/sign_block').signPlaced, BASE_PRIORITY);
	// ocean plats
	plugin.on('travelers::canPlaceStructure', require('./equipment/ocean_platform').canPlaceStructure, BASE_PRIORITY);
	// camo
	plugin.on('travelers::canPlayerSee', require('./equipment/active_camo').canSee, BASE_PRIORITY);
// trees
plugin.on('actions::gettree', require('./trees').gettree, BASE_PRIORITY);
plugin.on('actions::break', require('./trees').break, BASE_PRIORITY);
plugin.on('loadChunk', require('./trees').chunkLoad, BASE_PRIORITY);
plugin.on('saveChunk', require('./trees').unloadChunk, BASE_PRIORITY);
plugin.on('playerTick', require('./trees').playerTick, BASE_PRIORITY);
plugin.on('gameTickPre', require('./trees').tick, BASE_PRIORITY);
// base
require('./base').plugin(plugin);// give base access to the plugin for message popups
plugin.on('travelers::eventLogUnsafe', require('./base').eventLog, BASE_PRIORITY);
plugin.on('travelers::eventLog', require('./base').eventLogEscape, BASE_PRIORITY);
plugin.on('travelers::addExeJs', require('./base').addExeJs, BASE_PRIORITY);
plugin.on('playerConnect', require('./base').join, BASE_PRIORITY + 1000);
plugin.on('playerCreate', require('./base').create, BASE_PRIORITY);
// chunks
plugin.on('playerConnect', require('./chunks').tick, BASE_PRIORITY);
plugin.on('playerTick', require('./chunks').tick, BASE_PRIORITY - 10);
plugin.on('playerReady', require('./chunks').tick, BASE_PRIORITY - 10);
plugin.on('chunkSave', require('./chunks').save, BASE_PRIORITY);
plugin.on('gameTickPre', require('./chunks').gameTickPre, BASE_PRIORITY);
plugin.on('loadChunk', require('./chunks').chunkLoad, BASE_PRIORITY + 100);
plugin.on('saveChunk', require('./chunks').chunkUnload, BASE_PRIORITY);
// death
plugin.on('travelers::killPlayer', require('./death').kill, BASE_PRIORITY);
plugin.on('actions::suicide', require('./death').suicide, BASE_PRIORITY);
plugin.on('actions::reincarnate', require('./death').reincarnate, BASE_PRIORITY);
plugin.on('actions::loot_next', require('./death').loot_next, BASE_PRIORITY);
plugin.on('playerTick', require('./death').playerTick, BASE_PRIORITY - 10);
// other
plugin.on('actions::hands', require('./other').drop, BASE_PRIORITY);
plugin.on('actions::loot_next', require('./other').loot_next, BASE_PRIORITY);
// tutorial
plugin.on('actions::tut_inc', require('./tutorial').tutInc, BASE_PRIORITY);
plugin.on('actions::tut_skip', require('./tutorial').tutSkip, BASE_PRIORITY);
plugin.on('actions::loot_next', require('./tutorial').loot_next, BASE_PRIORITY);
plugin.on('playerCreate', require('./tutorial').playerCreate, BASE_PRIORITY);

// loading data
thetravelers.emit('travelers', 'addGameItems', require('./itemData.json'));
require('./events/houses.json').forEach(e=>thetravelers.emit('travelers', 'addEvent', 'house', require('./events/houses/' + e)));
require('./events/cites.json').forEach(e=>thetravelers.emit('travelers', 'addEvent', 'city', require('./events/cities/' + e)));
thetravelers.emit('travelers', 'addEvent', 'body', require('./events/other/body.json'));
thetravelers.emit('travelers', 'addEvent', 'backpack', require('./events/other/backpack.json'));
thetravelers.emit('travelers', 'addEvent', 'dropped_items', require('./events/other/droppedItems.json'));
thetravelers.emit('travelers', 'addEvent', 'trapdoor', require('./events/other/trapdoor.json'));
thetravelers.emit('travelers', 'addEvent', 'crater', require('./events/other/crater.json'));
thetravelers.emit('travelers', 'addEvent', 'hole', require('./events/other/hole.json'));
thetravelers.emit('travelers', 'addEvent', 'storageUnit', require('./events/other/smallBox.json'));
thetravelers.emit('travelers', 'addEvent', 'storageUnit', require('./events/other/largeBox.json'));
thetravelers.emit('travelers', 'addEvent', 'sign', require('./events/other/sign.json'));
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
// load structure data
require('./structures.json').forEach(s => thetravelers.emit('travelers', 'addStructureData', s));

plugin.addLeaderboard('experience',
	p => p.public.skills.xp,
	{xp: p => p.public.skills.xp, level: p => p.public.skills.level},
	{caption: x => x.xp + ' total xp', primary: l => 'level ' + l.level});
plugin.addLeaderboard('distance traveled',
	p => p.public.steps_taken,
	{steps_taken: p => p.public.steps_taken},
	{primary: l => l.steps_taken + 'km'});
plugin.addLeaderboard('hours played',
	p => p.public.seconds_played,
	{seconds_played: p => Math.round(p.public.seconds_played / thetravelers.options.tps)},
	{caption: x => x.seconds_played + ' total seconds', primary: l => (l.seconds_played / 3600).toFixed(1) + ' hours'});
plugin.addLeaderboard('locations explored',
	p => p.public.locs_explored,
	{locs_explored: p => p.public.locs_explored},
	{primary: l => l.locs_explored + ' locations'});

require('./how to play')(plugin);