const { xssReplace } = require('./base');
const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');
const { config } = require('.');
const { addData } = require('./events');

/**
 * @param {{x: number, y: number}} location any object that has an "x" and "y" property
 * @returns {string[]} usernames
 */
const getPlayersInInteraction = (location) => {
	const {x, y} = location;
	return chunks.getChunk(x, y).meta.players.filter(name => {
		const player = players.getPlayerByUsername(name);
		return player.public.state === 'int' && player.public.x === x && player.public.y === y;
	});
}

const remove = player => {
	const filter = val => val !== player.public.username
	return filter;
}

const playerData = n => players.getPlayerByUsername(n);

const online = n => players.isPlayerOnline(n);
const offline = n => !players.isPlayerOnline(n);

const canSee = (player, targetPlayer) => player && targetPlayer && targetPlayer.public.state === 'int' && targetPlayer.public.x === player.public.x && targetPlayer.public.y === player.public.y;

const renderPlayerList = loc => {
	const ps = getPlayersInInteraction(loc).map(p => {
		const response =  {
			username: p,
			online: false
		};

		if(players.isPlayerOnline(p)) {
			const data = players.getOnlinePlayer(p);
			response.in_battle = data.cache.activeBattleId !== undefined;
			response.online = true;
			response.has_constitution = data.private.effects && data.private.effects.constitution > 0;
		}
		return response;
	});
	const propRange = util.out(false, 'boolean');
	const {x, y} = loc;
	if(x <= Math.abs(config.spawn_challenge_radius) && x >= -Math.abs(config.spawn_challenge_radius) && y >= -Math.abs(config.spawn_challenge_radius) && y <= Math.abs(config.spawn_challenge_radius)) {
		propRange.set(true);
	}
	emit('travelers', 'isPropRange', loc.x, loc.y, propRange);
	getPlayersInInteraction(loc).filter(online).map(playerData).forEach(p => {
		p.temp.int_here = ps;
		p.temp.outside_protection = !propRange.get();
		p.addPropToQueue('int_here', 'outside_protection');
	});
}

module.exports.utils = {
	getPlayersInInteraction,
	online,
	playerData
};

/**
 * @param {players.player} player 
 */
module.exports.movePlayer = function(player) {
	if(player.public.state === 'travel' && player.cache.travelData.dir !== '') {
 		const {x, y} = player.public;
		 /**
		  * checks if a player can be brought into an event
		  * @param {players.player} p 
		  */
		const shouldBeMoved = p => (p.public.state === 'travel' || p.public.state === 'int') && p.public.username !== player.public.username && p.public.x === x && p.public.y === y;
		const activeChunk = chunks.getChunk(x, y);
		const playersToBeMoved = activeChunk.meta.players.filter(name => shouldBeMoved(players.getPlayerByUsername(name)));
		if(playersToBeMoved.length > 0) {
			// move them to interactions
			playersToBeMoved.filter(name => players.getPlayerByUsername(name).public.state === 'travel').forEach(name => emit('travelers', 'playerJoinInteraction', players.getPlayerByUsername(name)));
			emit('travelers', 'playerJoinInteraction', player);
			// now update everyone's player list
			renderPlayerList(player.public);
		}
	}
}

/**
 * @param {players.player} player 
 */
module.exports.playerReady = function(player) {
	if(player.public.state === 'int') {
		renderPlayerList(player.public);
		// stop other player looting
		getPlayersInInteraction(player.public).filter(online).map(playerData).forEach(p => {
			if(p.private.lootingPlayer === player.public.username) {
				emit('travelers', 'addExeJs', p, 'INT.doneLooting();');
				emit('travelers', 'renderItems', p);
				delete p.private.lootingPlayer;
			}
		});
	}
}

/**
 * @param {players.player} player 
 */
module.exports.disconnect = function(player) {
	if(player.public.state === 'int') {
		renderPlayerList(player.public);
	}
}

/**
 * @param {players.player} player 
 */
module.exports.playerConnect = function(player) {
	if(player.private.offline_msgs) {
		player.temp.offline_msgs = Object.values(player.private.offline_msgs);
		delete player.private.offline_msgs;
	}
	if(player.private.lootingPlayer) {
		const victim = players.getPlayerByUsername(player.private.lootingPlayer);
		player.temp.int_offlineloot = {
			username: player.private.lootingPlayer,
			loot: addData(victim.private.supplies),
			limit: victim.public.skills.max_carry
		};
		player.addPropToQueue('int_offlineloot');
	}
}

/**
 * @param {players.player} player 
 */
module.exports.playerTick = function(player) {
	if(player.cache.intLeaveTimeout) {
		player.cache.intLeaveTimeout--;
		if(player.cache.intLeaveTimeout <= 0)delete player.cache.intLeaveTimeout;
	}
}

/**
 * @param {players.player} player 
 */
module.exports.playerJoinInteraction = function(player) {
	player.public.state = 'int';
	if(players.isPlayerOnline(player.public.username)) {
		player.cache.intLeaveTimeout = 5;
		player.addPropToQueue('state');
	}
}

module.exports.battleEnd = function(battle) {
	renderPlayerList(battle.player1.public);
	const victor = battle.player1.public.skills.hp > 0 ? battle.player1 : battle.player2;
	const looser = battle.player1.public.skills.hp <= 0 ? battle.player1 : battle.player2;
	getPlayersInInteraction(battle.player1.public).filter(online).map(playerData).forEach(p => {
		p.temp.int_defeated = {
			victor: victor.public.username,
			loser: looser.public.username
		};
		p.addPropToQueue('int_defeated');
	});
}

module.exports.battleStart = function(battle) {
	getPlayersInInteraction(battle.player1.public).filter(online).map(playerData).forEach(p => {
		p.temp.int_pvpstarted = {
			attacker: battle.player1.public.username,
			defender: battle.player2.public.username
		};
		p.addPropToQueue('int_pvpstarted');
	});
}

/**
 * @param {players.player} player 
 */
module.exports.leave_int = function(packet, player) {
	if(player.cache.intLeaveTimeout || player.cache.activeBattleId)return false;
	player.public.state = 'travel';
	player.addPropToQueue('state');
}

/**
 * @param {players.player} player 
 */
module.exports.chat = function(packet, player) {
	if(typeof packet.message !== 'string' || packet.message.length > 200)return false;
	getPlayersInInteraction(player.public).filter(online).forEach(name => {
		const p = players.getOnlinePlayer(name);
		if(p.temp.int_messages === undefined) {
			p.temp.int_messages = [];
		}
		p.temp.int_messages.push({
			text: xssReplace(packet.message),
			from: player.public.username
		});
		p.addPropToQueue('int_messages');
	})
}

/**
 * @param {players.player} player 
 */
module.exports.leaveMessage = function(packet, player) {
	if(typeof packet.username === 'string' && typeof packet.msg === 'string') {
		if(!players.isPlayerOnline(packet.username)) {
			const targetPlayer = players.getPlayerByUsername(packet.username);
			if(targetPlayer.public.state === 'int' && targetPlayer.public.x === player.public.x && targetPlayer.public.y === player.public.y && packet.msg.length <= 200) {
				if(targetPlayer.private.offline_msgs === undefined) {
					targetPlayer.private.offline_msgs = {};
				}
				targetPlayer.private.offline_msgs[player.public.username] = xssReplace(packet.msg);
			}
		}
	}
}

/**
 * @param {players.player} player 
 */
module.exports.getMessage = function(packet, player) {
	const targetPlayer = players.getPlayerByUsername(packet.username);
	if(canSee(player, targetPlayer) && offline(packet.username)) {
		player.temp.int_gotmsg = targetPlayer.private.offline_msgs[player.public.username];
		player.addPropToQueue('int_gotmsg');
	}
}

/**
 * @param {players.player} player 
 */
 module.exports.removeMessage = function(packet, player) {
	const targetPlayer = players.getPlayerByUsername(packet.username);
	if(canSee(player, targetPlayer) && offline(packet.username)) {
		delete targetPlayer.private.offline_msgs[player.public.username];
	}
}

module.exports.lootOffline = function(packet, player) {
	if(typeof packet.username === 'string' && offline(packet.username)) {
		player.private.lootingPlayer = packet.username;
		const victim = players.getPlayerByUsername(packet.username);
		player.temp.int_offlineloot = {
			username: packet.username,
			loot: addData(victim.private.supplies),
			limit: victim.public.skills.max_carry
		};
		player.addPropToQueue('int_offlineloot');
	}
}

module.exports.next = function(packet, player) {
	if(player.private.lootingPlayer) {
		delete player.private.lootingPlayer;
		emit('travelers', 'addExeJs', player, 'INT.doneLooting();');
		emit('travelers', 'renderItems', player);
	}
}

module.exports.killOffline = function(packet, player) {
	if(typeof packet.username === 'string' && offline(packet.username)) {
		const victim = players.getPlayerByUsername(packet.username);
		emit('travelers', 'killPlayer', victim);
		renderPlayerList(player.public);
		const killMsg = {
			victim: packet.username,
			killer: player.public.username
		};
		getPlayersInInteraction(player.public).filter(online).forEach(p => {
			const pl = players.getOnlinePlayer(p);
			pl.temp.int_killer = killMsg;
			pl.addPropToQueue('int_killer')
		});
	}
}