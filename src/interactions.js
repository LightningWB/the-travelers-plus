const { xssReplace } = require('./base');
const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');

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

const renderPlayerList = loc => {
	const ps = getPlayersInInteraction(loc).map(p => {
		return {
			username: p,
			in_battle: false,
			online: players.isPlayerOnline(p)
		}
	});
	getPlayersInInteraction(loc).filter(online).map(playerData).forEach(p => {
		p.temp.int_here = ps;
		p.addPropToQueue('int_here');
	});
}

/**
 * @param {players.player} player 
 */
module.exports.movePlayer = function(player) {
	if(player.public.state === 'travel') {
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
module.exports.playerConnect = function(player) {
	if(player.public.state === 'int') {
		renderPlayerList(player.public);
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
	player.cache.intLeaveTimeout = 5;
	if(players.isPlayerOnline(player.public.username)) {
		player.addPropToQueue('state');
	}
}

/**
 * @param {players.player} player 
 */
module.exports.leave_int = function(packet, player) {
	if(player.cache.intLeaveTimeout)return false;
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