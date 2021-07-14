const {emit, players, util, chunks} = require('./bullet');

/**
 * @param {players.player} player 
 */
 module.exports.join = function(player) {
	player.addPropToQueue('*');// just a good idea to set everything to send when they join
}

/**
 * @param {players.player} player 
 */
module.exports.create = function(player) {
	player.public.x = util.rand(-500, 500);
	player.public.y = util.rand(-500, 500);
}