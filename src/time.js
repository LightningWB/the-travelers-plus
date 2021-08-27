const { saveStorage, storage } = require('./index');

let GAME_TIME = storage.time || 0;

module.exports.gameTickPre = function() {
	GAME_TIME++;
	if(GAME_TIME % 100 === 0)
	{
		storage.time = GAME_TIME;
		saveStorage();
	}
}

module.exports.playerTick = function(player) {
	player.temp.turn = GAME_TIME;
	player.addPropToQueue('turn');
}

module.exports.getTime = out => out.set(GAME_TIME);
module.exports.setTime = out => GAME_TIME = out.get();