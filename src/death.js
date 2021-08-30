const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');

module.exports.kill = function(player) {
	emit('travelers', 'resetLevel', player);
	if (player.public.deaths === undefined)player.public.deaths = 0;
	++player.public.deaths;
	player.public.state = 'death';
	delete player.public.equipped;
	player.public.death_x = player.public.x;// use public to also say after a relog
	player.public.death_y = player.public.y;
	
	emit('travelers', 'addEventTile',
		player.public.x,
		player.public.y,
		'@',
		'body',
		'body'
	);
	const eventObj = chunks.getObject(player.public.x, player.public.y);
	require('./crafting').cancelAll(null, player, false);
	eventObj.private.eventData.loot = {main: util.clone(player.private.supplies)};
	player.private.supplies = {};
	
	if(players.isPlayerOnline(player.public.username)) {
		player.temp.effects_removed = true;
		player.addPropToQueue('craft_queue');
		emit('travelers','addExeJs', player, 'ENGINE.console.innerHTML = \'\';ENGINE.logMsgs = [];');
		player.addPropToQueue('deaths', 'state', 'effects_removed', 'death_x', 'death_y');
	}
}

module.exports.loot_next = function(_packet, player) {
	const eventObj = chunks.getObject(player.public.x, player.public.y);
	if(eventObj && eventObj.private.eventData && eventObj.private.eventData.type === 'body') {
		const items = eventObj.private.eventData.loot.main;
		let count = 0;
		for(const id in items) {
			if(typeof items[id] === 'number' && !isNaN(items[id])) {
				count += items[id];
			}
		}
		if(count <= 0) {
			chunks.removeObject(player.public.x, player.public.y);
		}
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
  emit('travelers', 'resetSkills', player);
  emit('travelers', 'renderItems', player);
  emit('travelers', 'calcWeight', player);
  player.addPropToQueue('*');
}