const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');

module.exports.playerConnect = function(player) {
  player.temp.death_x = player.public.x;
  player.temp.death_y = player.public.y;
  player.addPropToQueue('*');
}

module.exports.suicide = function(_packet, player) {
  if (player.private.deaths === undefined)player.private.deaths = 0;
  ++player.private.deaths;
  player.public.state = 'death';
  player.temp.effects_removed = true;
  player.temp.death_x = player.public.x;
  player.temp.death_y = player.public.y;
  player.temp.exe_js = 'ENGINE.console.innerHTML = \'\';ENGINE.logMsgs = [];';

  player.addPropToQueue('deaths', 'state', 'effects_removed', 'death_x', 'death_y', 'exe_js');
}

module.exports.reincarnate = function(_packet, player) {
  const val = util.out({x:util.rand(-500, 500), y:util.rand(-500, 500)}, 'object');
  emit('travelers', 'getSpawnLocation', player, val);
  player.public.x = val.get().x;
	player.public.y = val.get().y;
  player.public.state = 'travel';
  emit('actions', 'reset_skills', null, player);
  player.addPropToQueue('*');
}