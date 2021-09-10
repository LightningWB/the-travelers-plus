const TRAVEL = 'travel',
	EVENT = 'event',
	LOOTING = 'looting',
	INT = 'int',
	DEATH = 'death';

const actionStates = {
	// tutorial
	tut_inc: TRAVEL,
	tut_skip: TRAVEL,
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
	build: TRAVEL,
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

const allowedValues = {
	break: {
		option: 'string',
		dir: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
	},
	build: {
		option: 'string'
	}
}

module.exports.registerStates = function(plugin) {
	const keys = Object.keys(actionStates);
	for(const key of keys)
	{
		const state = actionStates[key];
		const allowedVals = allowedValues[key];
		plugin.on('actions::' + key, (packet, player)=>{
			if(player.public.state !== state)return false;
			if(allowedVals) {
				for(const id in allowedVals) {
					if(packet[id] === undefined)return false;
					if(Array.isArray(allowedVals[id])) {
						if(!allowedVals[id].includes(packet[id]))return false;
					}
					else if(typeof packet[id] !== allowedVals[id])return false;
				}
			}
		}, 100);
	}
}