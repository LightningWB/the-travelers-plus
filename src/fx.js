const { emit, players, generateTileAt, chunks } = require('./bullet');

/**
 * @type {import('./fx help').fullData}
 */
const EFFECTS = {};

function renderEffects(player) {
	if(player.temp.effects === undefined) {
		player.temp.effects = {};
	}
	player.addPropToQueue('effects');
	for(const effect in player.private.effects) {
		const effectData = EFFECTS[effect];
		if(effectData) {
			player.temp.effects[effectData.name] = {
				tip: effectData.tip,
				time: player.private.effects[effect]
			};
		} else {
			delete player.private.effects[effect];
		}
	}
}

module.exports.addEffect = function(player, effectId, time = Infinity) {
	if(player.private.effects === undefined) {
		player.private.effects = {};
	}
	if(EFFECTS[effectId]) {
		player.private.effects[effectId] = time;
		renderEffects(player);
	} else {
		return false;
	}
}

module.exports.playerTick = function(player) {
	if(player.private.effects && player.public.state === 'travel') {
		for(const effect in player.private.effects) {
			if(player.private.effects[effect] !== undefined) {
				if(--player.private.effects[effect] <= 0) {
					delete player.private.effects[effect];
				}
			}
		}
		if(Object.keys(player.private.effects).length === 0) {
			delete player.private.effects;
		}
	}
}

module.exports.playerKill = function(player) {
	delete player.private.effects;
}

module.exports.playerJoin = function(player) {
	renderEffects(player);
}

/**
 * @param {string} id
 * @param {import('./fx help').effect} effect 
 */
module.exports.addGameEffect = function(id, effect) {
	EFFECTS[id] = effect;
}

module.exports.ready = function() {
	emit('travelers', 'addGameEffect', 'constitution', {
		name: 'constitution',
		tip: 'fsnjisdji'
	});
}

//constitution

module.exports.isChallenge = function(_player, opponent, out) {
	if(!out.get()) {
		if(opponent.private.effects && opponent.private.effects.constitution) {
			out.set(true);
		}
	}
}

module.exports.playerJoinInteraction = function(player) {
	if(player.private.breakStructure && player.private.effects && player.private.effects.constitution) {
		delete player.private.effects.constitution;
		if(players.isPlayerOnline(player.public.username)) {
			renderEffects(player);
		}
	}
}

// overencumber
module.exports.getMovementSpeed = function(player, out) {
	if(player.public.skills.carry > player.public.skills.max_carry) {
		if(player.public.skills.sp <= 0) {
			if(!(generateTileAt(player.public.x, player.public.y) === 'w' || chunks.isObjectHere(player.public.x, player.public.y))) {
				out.set(0);
			}
		} else {
			player.public.skills.sp--;
			player.addPropToQueue('skills');
		}
	}
}