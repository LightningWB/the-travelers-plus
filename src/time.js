let GAME_TIME = 0;

module.exports.gameTickPre = function() {
	GAME_TIME++;
}

module.exports.playerTick = function(player) {
	player.temp.turn = GAME_TIME;
	player.addPropToQueue('turn');
}