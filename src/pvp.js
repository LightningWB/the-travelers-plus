const { players, util, emit, options } = require('./bullet');
const getItem = require('./supplies').item;
const getItems = require('./supplies').getItems;
const getTime = () => {
	const out = util.out(0, 'int');
	emit('travelers', 'getTime', out);
	return out.get();
}

const defaultBattleStats = {
	weapon: 'hands',
	move: '',
	ready: false
};

const STAM_REGEN = 10;

/**
 * represents a battle between two people
 */
class Battle {
	/**
	 * 0 for ready screen, 1 for combat, 2 for break and 3 for end
	 * @type {0 | 1 | 2 | 3}
	 */
	battleState = 0;
	nextRoundTurn = getTime() + (Math.ceil(options.tps) * 60);// this gets changed later on anyways
	round = 1;
	abstainCount = 0;
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
		this.id = randString;
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
				next_round: this.nextRoundTurn,
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
			p1.temp.battle_startnextround = {
				next_round: this.nextRoundTurn,
				round: this.round
			};
			p1.addPropToQueue('battle_startnextround');
		}
	}

	/**
	 * @param {players.player} p1 
	 * @param {players.player} p2 
	 */
	addBattleRecap(p1, p2) {
		if(players.isPlayerOnline(p1.public.username)) {
			p1.temp.battle_roundreview = {
				next_round: this.nextRoundTurn,
				opp_hp: p2.public.skills.hp,
				opp_option: p2.cache.battleStats.move,
				opp_sp: p2.public.skills.sp,
				you_option: p1.cache.battleStats.move
			};
			p1.addPropToQueue('battle_roundreview', 'skills');
		}
	}

	endScreen(p1, p2) {
		if(players.isPlayerOnline(p1.public.username)) {
			p1.temp.battle_over = {
				next_round: this.nextRoundTurn,
				youWon: p1.public.skills.hp > 0,
				opp_username: p2.public.username,
				round: this.round		
			};
			p1.addPropToQueue('battle_over');
		}
	}

	exit(player) {
		if(players.isPlayerOnline(player.public.username)) {
			player.temp.battle_close = true;
			player.addPropToQueue('battle_close');
			delete player.cache.battleStats;
			delete player.cache.activeBattleId;
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
		} else if(this.battleState === 2) {
			this.addBattleRecap(this.player1, this.player2);
			this.addBattleRecap(this.player2, this.player1);
		} else if(this.battleState === 3) {
			if(newState) {
				this.endScreen(this.player1, this.player2);
				this.endScreen(this.player2, this.player1);
			}
		}
	}

	/**
	 * @param {object} packet 
	 * @param {players.player} player 
	 */
	onReady(packet, player) {
		if(this.battleState === 0) {
			if(Battle.weapons[packet.weapon] && (packet.weapon === 'hands' || player.private.supplies[packet.weapon] > 0)) {
				player.cache.battleStats.weapon = packet.weapon;
				player.cache.battleStats.ready = true;
				player.temp.battle_ready_weapon = packet.weapon;
				player.addPropToQueue('battle_ready_weapon');
			}
		}
	}

	onExecute(_packet, player) {
		if(this.battleState === 3) {
			this.closeFight();
		}
	}

	onEndChat(packet, player) {
		this.player1.addPropToQueue('battle_endchatmsg')
		this.player2.addPropToQueue('battle_endchatmsg')
		this.player1.temp.battle_endchatmsg = {
			from: player.public.username,
			message: require('./base').xssReplace(packet.message.substr(0, 200))
		};
		this.player2.temp.battle_endchatmsg = {
			from: player.public.username,
			message: require('./base').xssReplace(packet.message.substr(0, 200))
		};
	}

	static ALLOWED_BATTLE_OPS = ['h', 'ar', 'al', 'dl', 'dr', 'b'];
	/**
	 * @param {object} packet 
	 * @param {players.player} player 
	 */
	onBattleOpt(packet, player) {
		if(typeof packet.option === 'string' && Battle.ALLOWED_BATTLE_OPS.includes(packet.option)) {
			player.cache.battleStats.move = packet.option;
		}
	}

	recapRound() {
		this.battleState = 2;
		this.round++;
		this.nextRoundTurn = getTime() + Math.ceil(options.tps) * 5;
		this.computeAttacks(this.player1, this.player2);
		this.computeAttacks(this.player2, this.player1);
		this.sendData();
		// now that needed stuff is done clear some data
		if(this.player1.cache.battleStats.move === '' && this.player2.cache.battleStats.move === '') {
			this.abstainCount++;
		} else this.abstainCount = 0;
		this.player1.cache.battleStats.move = '';
		this.player2.cache.battleStats.move = '';
	}

	startNewRound() {
		if(this.player1.public.skills.hp <= 0 || this.player2.public.skills.hp <= 0 || this.abstainCount >= 10) {
			this.battleState = 3;
			this.nextRoundTurn = getTime() + Math.ceil(options.tps) * 30;
		} else {
			this.battleState = 1;
			this.nextRoundTurn = getTime() + Math.ceil(options.tps) * 5;
		}
		this.sendData();
	}

	tick() {
		if(this.battleState === 0) {
			if(getTime() >= this.nextRoundTurn || (this.player1.cache.battleStats.ready && this.player2.cache.battleStats.ready)) {
				return this.moveToFight();
			}
		} else if(this.battleState === 1) {
			if(getTime() === this.nextRoundTurn) {
				this.recapRound();
			}
		} else if(this.battleState === 2) {
			if(getTime() === this.nextRoundTurn) {
				this.startNewRound();
			}
		} else if(this.battleState === 3) {
			if(getTime() === this.nextRoundTurn) {
				this.closeFight();
			}
		}
	}

	moveToFight() {
		this.battleState = 1;
		this.nextRoundTurn = getTime() + Math.ceil(options.tps) * 15;
		this.sendData(true);
	}

	computeAttacks(p1, p2) {
		const p1Skills = p1.public.skills;
		const p2Skills = p2.public.skills;
		const p1Attack = Battle.weapons[p1.cache.battleStats.weapon].dmg + p1Skills.dmg;
		const p1Stam = Battle.weapons[p1.cache.battleStats.weapon].sp;
		const p1Move = p1.cache.battleStats.move;
		const p2Move = p2.cache.battleStats.move;
		switch (p1Move) {
			case 'h':
				if(p2Move !== 'h') {
					p2Skills.hp -= p1Attack * 2;
				}
				p1Skills.sp -= p1Stam * 2;
				break;
			case 'al':
				if(p2Move !== 'h' && p2Move !== 'ar' && p2Move !== 'al' && p2Move !== 'dr') {
					p2Skills.hp -= p1Attack;
				}
				p1Skills.sp -= p1Stam * 2;
				break;
			case 'ar':
				if(p2Move !== 'h' && p2Move !== 'ar' && p2Move !== 'al' && p2Move !== 'dl') {
					p2Skills.hp -= p1Attack;
				}
				p1Skills.sp -= p1Stam * 2;
				break;
			case 'dl':
				if(p2Move !== 'al') {
					p1Skills.sp += STAM_REGEN;
				}
				break;
			case 'dr':
				if(p2Move !== 'ar') {
					p1Skills.sp += STAM_REGEN;
				}
				break;
			case 'b':
				if(p2Move !== 'h') {
					p1Skills.sp += STAM_REGEN;
				}
				break;
			case '':// abstain
				p1Skills.sp += STAM_REGEN;
				break;
		}
		if(p1Skills.sp > p1Skills.max_sp) {
			p1Skills.sp = p1Skills.max_sp;
		}
		if(p2Skills.hp < 0) {
			p2Skills.hp = 0;
		}
	}

	closeFight() {
		if(this.player1.public.skills.hp <= 0) {
			emit('travelers', 'killPlayer', this.player1);
		}
		if(this.player2.public.skills.hp <= 0) {
			emit('travelers', 'killPlayer', this.player2);
		}
		this.exit(this.player1);
		this.exit(this.player2);
		delete battles[this.id];
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
		if(opponent.cache.activeBattleId || player.cache.activeBattleId || opponent.public.state !== 'int')return false;
		new Battle(player, opponent);
	}
}

module.exports.acceptChallenge = function(packet, player) {
	console.log(packet);
}

module.exports.endChat = function(packet, player) {
	if(player.cache.activeBattleId) {
		battles[player.cache.activeBattleId].onEndChat(packet, player);
	} else return false;
}

module.exports.startReady = function(packet, player) {
	if(player.cache.activeBattleId) {
		battles[player.cache.activeBattleId].onReady(packet, player);
	} else return false;
}

module.exports.execute = function(packet, player) {
	if(player.cache.activeBattleId) {
		battles[player.cache.activeBattleId].onExecute(packet, player);
	} else return false;
}

module.exports.battleOpt = function(packet, player) {
	if(player.cache.activeBattleId) {
		battles[player.cache.activeBattleId].onBattleOpt(packet, player);
	} else return false;
}

module.exports.onReady = function() {
	const items = getItems();
	for(const itemId in items) {
		if(items[itemId].weapon) {
			Battle.weapons[itemId] = {
				dmg: items[itemId].weapon_data.dmg,
				sp: items[itemId].weapon_data.sp
			}
		}
	}
}