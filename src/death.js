const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');

module.exports.kill = function(player) {
	if (player.public.deaths === undefined)player.public.deaths = 0;
	++player.public.deaths;
	player.public.state = 'death';
	player.temp.effects_removed = true;
	delete player.public.equipped;
	player.public.death_x = player.public.x;// use public to also say after a relog
	player.public.death_y = player.public.y;
	
	if(players.isPlayerOnline(player.public.username)) {
		emit('travelers','addExeJs', player, 'ENGINE.console.innerHTML = \'\';ENGINE.logMsgs = [];');
		player.addPropToQueue('deaths', 'state', 'effects_removed', 'death_x', 'death_y');
	}
}

module.exports.suicide = function(_packet, player) {
	emit('travelers', 'killPlayer', player);
}

module.exports.reincarnate = function(_packet, player) {
  const val = util.out({x:util.rand(-500, 500), y:util.rand(-500, 500)}, 'object');
  emit('travelers', 'getSpawnLocation', player, val);
  player.public.x = val.get().x;
	player.public.y = val.get().y;
  player.public.state = 'travel';
  delete player.public.death_x;
  delete player.public.death_y;
  emit('actions', 'reset_skills', null, player);
  emit('travelers', 'renderItems', player);
  emit('travelers', 'calcWeight', player);
  player.addPropToQueue('*');
}