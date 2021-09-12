const { players, util, emit, options } = require('./bullet');
const getItem = require('./supplies').item;
const getItems = require('./supplies').getItems;
const getTime = () => {
	const out = util.out(0, 'int');
	emit('travelers', 'getTime', out);
	return out.get();
}

const defaultBattleStats = {
	weapon: 'hands'
};

/**
 * represents a battle between two people
 */
class Battle {
	/**
	 * 0 for ready screen, 1 for combat, 2 for break and 3 for end
	 * @type {0 | 1 | 2 | 3}
	 */
	battleState = 0;
	turn = 0;
	round = 0;
	static weapons = {
		hands: {
			dmg: 0,
			sp: 8
		}
	}
	/**
	 * @param {players.player} player1 
	 * @param {players.player} player2 
	 */
	constructor(player1, player2) {
		/**
		 * player who started fight
		 */
		this.player1 = player1;
		/**
		 * victim
		 */
		this.player2 = player2;

		// stuff like their weapon of choice
		player1.cache.battleStats = util.clone(defaultBattleStats);
		player2.cache.battleStats = util.clone(defaultBattleStats);

		let randString = util.randomString(100);
		while(battles[randString] !== undefined) {
			randString = util.randomString(100);
		}
		this.player1.cache.activeBattleId = randString;
		this.player2.cache.activeBattleId = randString;
		battles[randString] = this;
		this.sendData();
	}

	/**
	 * @param {players.player} p1 
	 * @param {players.player} p2 
	 */
	addPlayerStartFightInfo(p1, p2) {
		if(players.isPlayerOnline(p1.public.username)) {
			const oppWeapon = Battle.weapons[p2.cache.battleStats.weapon];
			const youWeapon = Battle.weapons[p1.cache.battleStats.weapon];
			p1.temp.battle_startround = {
				next_round: getTime() + (options.tps * 15),
				opp_base_dmg: p2.public.skills.dmg,
				opp_hp: p2.public.skills.hp,
				opp_lvl: p2.public.skills.level,
				opp_max_hp: p2.public.skills.max_hp,
				opp_max_sp: p2.public.skills.max_sp,
				opp_option: '',
				opp_sp: p2.public.skills.sp,
				opp_username: p2.public.username,
				opp_weapon: p2.cache.battleStats.weapon,
				opp_weapon_dmg: oppWeapon.dmg,
				opp_weapon_sp: oppWeapon.sp,
				round: this.round,
				round_type: 'fight',
				youWon: false,
				you_option: '',
				you_weapon: p1.cache.battleStats.weapon,
				you_weapon_dmg: youWeapon.dmg,
				you_weapon_sp: youWeapon.sp
			};
			p1.addPropToQueue('battle_startround');
		}
	}

	/**
	 * @param {players.player} p1 
	 * @param {players.player} p2 
	 */
	addBattleView(p1, p2) {
		if(players.isPlayerOnline(p1.public.username)) {
			p1.temp.battle_roundview = {
				next_round: getTime() + (options.tps * 5),
				opp_hp: p2.public.skills.hp,
				opp_option: '',// todo
				opp_sp: p2.public.skills.sp,
				you_option: ''// todo
			};
			p1.addPropToQueue('battle_roundview');
		}
	}

	sendData(newState = true) {
		if(this.battleState === 0) {
			if(players.isPlayerOnline(this.player1.public.username)) {
				this.player1.temp.battle_start = {
					against: this.player2.public.username,
					youAttacked: true// player one always starts the fights
				}
				this.player1.addPropToQueue('battle_start');
			}
			if(players.isPlayerOnline(this.player1.public.username)) {
				this.player2.temp.battle_start = {
					against: this.player1.public.username,
					youAttacked: false// player one always starts the fights
				}
				this.player2.addPropToQueue('battle_start');
			}
		} else if(this.battleState === 1) {
			if(newState) {// send player weapons and such
				this.addPlayerStartFightInfo(this.player1, this.player2);
				this.addPlayerStartFightInfo(this.player2, this.player1);
			} else {
				this.addBattleView(this.player1, this.player2);
				this.addBattleView(this.player2, this.player1);
			}
		}
	}

	/**
	 * @param {object} packet 
	 * @param {players.player} player 
	 */
	onReady(packet, player) {
		if(this.battleState === 0) {
			const weapon = getItem(packet.weapon);
			if(weapon && weapon.weapon) {
				player.cache.battleStats.weapon = packet.weapon;
				player.temp.battle_ready_weapon = packet.weapon;
				player.addPropToQueue('battle_ready_weapon');
			}
		}
	}

	tick() {
		if(this.battleState === 0) {
			if(this.turn === 59) {
				return this.moveToFight();
			}
		} else if(this.battleState === 1) {

		}
		this.turn++;
	}

	moveToFight() {
		this.battleState = 1;
		this.turn = 0;
		this.sendData(true);
	}
}

/**
 * @type {{[key:string]:Battle}}
 */
const battles = {};

module.exports.tick = function() {
	for(const id in battles) {
		battles[id].tick();
	}
}

module.exports.attack = function(packet, player) {
	if(typeof packet.option === 'string' && players.isPlayerOnline(packet.option)) {
		const opponent = players.getPlayerByUsername(packet.option);
		if(opponent.cache.activeBattleId || player.cache.activeBattleId)return false;
		new Battle(player, opponent);
	}
}

module.exports.acceptChallenge = function(packet, player) {
	console.log(packet);
}

module.exports.endChat = function(packet, player) {
	console.log(packet);
}

module.exports.startReady = function(packet, player) {
	if(player.cache.activeBattleId) {
		battles[activeBattleId].onReady(packet, player);
	} else return false;
}

module.exports.execute = function(packet, player) {
	console.log(packet);
}

module.exports.battleOpt = function(packet, player) {
	console.log(packet);
}

module.exports.onReady = function() {
	const items = getItems();
	for(const itemId in items) {
		if(items[itemId].weapon) {
			Battle.weapons[itemId] = {
				dmg: items[itemId].dmg,
				sp: items[itemId].sp
			}
		}
	}
}