const TRAVEL = 'travel',
	EVENT = 'event',
	LOOTING = 'looting',
	INT = 'int',
	DEATH = 'death';

const actionStates = {
	// travel
	setDir: TRAVEL,
	doublestep: TRAVEL,
	skill_upgrade: TRAVEL,
	reset_skills: TRAVEL,
	craft: TRAVEL,
	craft_cancelall: TRAVEL,
	craft_cancelone: TRAVEL,
	hands: TRAVEL,
	learn: TRAVEL,
	equip: TRAVEL,
	dequip: TRAVEL,
	equipment: TRAVEL,
	build: TRAVEL,
	genmsg: TRAVEL,
	gettree: TRAVEL,
	suicide: TRAVEL,
	cancel_break: TRAVEL,
	break: TRAVEL,
	reenter: TRAVEL,
	// event
	event_choice: EVENT,
	// looting
	loot_next: LOOTING,
	loot_exchange: LOOTING,
	loot_takeall: LOOTING,
	// interaction
	leave_int: INT,
	int_leavemsg: INT,
	int_removemsg: INT,
	int_getmsg: INT,
	int_killoffline: INT,
	int_lootoffline: INT,
	'pvp-attack': INT,
	int_acceptchal: INT,
	int_exchange: INT,
	int_takeall: INT,
	int_next: INT,
	chat: INT,
	'pvp-endchat': INT,
	'pvp-startready': INT,
	'pvp-execute': INT,
	'pvp-battleopt': INT,
	// death
	reincarnate: DEATH
};

module.exports.registerStates = function(plugin) {
	const keys = Object.keys(actionStates);
	for(const key of keys)
	{
		const state = actionStates[key];
		plugin.on('actions::' + key, (packet, player)=>{
			if(player.public.state !== state)return false;
		}, 100);
	}
}