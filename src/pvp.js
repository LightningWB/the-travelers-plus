const { players } = require('./bullet');

/**
 * represents a battle between two people
 */
class battle {
	/**
	 * @param {players.player} player1 
	 * @param {players.player} player2 
	 */
	constructor(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;

		this.player1.cache.inBattle = true;
		this.player2.cache.inBattle = true;
	}

	tick() {

	}
}

/**
 * @type {{[key:string]:battle}}
 */
const battles = {};

module.exports.tick = function() {
	for(const id of battles) {
		battles[id].tick();
	}
}

module.exports.attack = function(packet, player) {
	console.log(packet);
}

module.exports.acceptChallenge = function(packet, player) {
	console.log(packet);
}

module.exports.endChat = function(packet, player) {
	console.log(packet);
}

module.exports.startReady = function(packet, player) {
	console.log(packet);
}

module.exports.execute = function(packet, player) {
	console.log(packet);
}

module.exports.battleOpt = function(packet, player) {
	console.log(packet);
}