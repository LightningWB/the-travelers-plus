const { chunks, emit, triggerEvent, players, SAVE_INTERVAL } = require('./bullet')

let turn = 0;
let activeChunks = [];

const checkChunkPlayers = (chunk, chunkX, chunkY) => {
	if(chunk && chunk.meta.players === undefined)chunk.meta.players = [];
	for(const name of chunk.meta.players) {
		const player = players.getPlayerByUsername(name);
		const {x, y} = player.public;
		if(chunk && x !== chunkX && y !== chunkY && chunk.meta.players.includes(player.public.username))
		{
			const playerIndex = chunk.meta.players.findIndex((playerInChunk) => playerInChunk === player.public.username);
			chunk.meta.players.splice(playerIndex, 1);
		}
	}
	for(const name of chunk.meta.players) {
		while(chunk.meta.players.lastIndexOf(name) !== chunk.meta.players.indexOf(name)) {
			const playerIndex = chunk.meta.players.lastIndexOf(name);
			chunk.meta.players.splice(playerIndex, 1);
		}
	}
}

/**
 * @param {import('../../player').playerData} player 
 */
module.exports.tick = function(player)
{
	if(player.public.state === 'death') {// dead players don't need chunks loaded
		return;
	}
	// loading chunks
	const {x: chunkX, y: chunkY} = chunks.toChunkCoords(player.public.x, player.public.y);
	const meX = player.public.x;
	const meY = player.public.y;
	const me = player;
	if(player.temp.proximity === undefined) {
		player.temp.proximity = {};
	}
	if(player.temp.proximity.objs === undefined) {
		player.temp.proximity.objs = [];
	}
	for(let x = chunkX - 1; x <= chunkX + 1; x++)
	{
		for(let y = chunkY - 1; y <= chunkY + 1; y++)
		{
			if(!chunks.isChunkCoordsLoaded(x, y))
			{
				chunks.loadChunk(x, y);
			}
			// player chunk lists
			const chunk = chunks.getChunkFromChunkCoords(x, y);
			checkChunkPlayers(chunk);
			if(chunk && x === chunkX  && y === chunkY && !chunk.meta.players.includes(player.public.username))chunk.meta.players.push(player.public.username);
			const ps = [];
			if(chunk) for(const username of chunk.meta.players)
			{
				if(username !== me.public.username)
				{
					const player = players.getPlayerByUsername(username);
					if(
						player.public.state !== 'death' &&
						(player.public.x > meX - 16 && player.public.x < meX + 16) &&// x values
						(player.public.y > meY - 16 && player.public.y < meY + 16)// y values
					){
						ps.push({x: player.public.x, y: player.public.y});
					}
				}
			}
			if(ps.length > 0)
			{
				player.temp.proximity.players = ps;
				player.addPropToQueue('proximity');
			}
			if(!activeChunks.includes(x+'|'+y))activeChunks.push(x+'|'+y);
		}
	}
	// rendering
	const proximity = [];
	for(let x = player.public.x-15; x < player.public.x + 16; x++)
	{
		for(let y = player.public.y-15; y < player.public.y + 16; y++)
		{
			const object = chunks.getObject(x, y);
			if(object && object.private && object.private.visible !== false)
			{
				proximity.push(object.public);
			}
		}
	}
	if(proximity.length>0)
	{
		player.temp.proximity.objs = player.temp.proximity.objs.concat(proximity);
		player.addPropToQueue('proximity');
	}
}

module.exports.gameTickPre = function()
{
	if(turn % SAVE_INTERVAL === 0)activeChunks = [];
}

module.exports.save = function()
{
	const loadedChunks = chunks.getLoadedChunks();
	for(const chunkId of loadedChunks)
	{
		const x = parseInt(chunkId.split('|')[0]);
		const y = parseInt(chunkId.split('|')[1]);
		const chunk = chunks.getChunkFromChunkCoords(x, y);
		if(!chunk)
		{
			//console.log(chunkId, chunk, activeChunks, loadedChunks)
		}
		else
		{
			if(chunk.meta.players)
			{
				const ps = [];
				for(const player of chunk.meta.players)
				{
					const p = players.getPlayerByUsername(player);
					const {x: playerX, y: playerY} = chunks.toChunkCoords(p.public.x, p.public.y);
					if(playerX === x && playerY === y)ps.push(player);
				}
				chunk.meta.players = ps;
			}
			for(const key in chunk) {
				if(key !== 'meta') {
					try {
						if(chunk[key]) for(const obj of chunk[key]) {
							if(obj.private.expiry) {
								if(new Date().getTime() > obj.private.expiry) {
									chunks.removeObject(obj.public.x, obj.public.y);
								}
							}
						}
					} catch(err) {
						console.log(key, chunk[key]);
						throw err;
					}
				}
			}
			if(!activeChunks.includes(chunkId))
			{
				chunks.unLoadChunk(x, y);
			}
			else chunks.saveChunk(x, y);
		}
	}
}

module.exports.chunkLoad = function(chunk) {
	if(chunk.players)// allow old saves to work nicely
	{
		chunk.meta.players = chunk.players;
		delete chunk.players;
	}
	else if(chunk.meta.players === undefined)chunk.meta.players = [];
	for(const key in chunk) {
		if(key !== 'meta' && chunk[key]) {
			const splitUp = key.split('|');
			const x = parseInt(splitUp[0]);
			const y = parseInt(splitUp[1]);
			for(const obj of chunk[key]) {
				if(obj.public.x === undefined) {
					obj.public.x = x;
				}
				if(obj.public.y === undefined) {
					obj.public.y = y;
				}
				if(obj.private.expiry !== undefined) {
					if(new Date().getTime() > obj.private.expiry) {
						chunks.removeObject(obj.public.x, obj.public.y);
					}
				}
			}
		}
	}
}

module.exports.chunkUnload = function(chunk) {
	if(chunk.meta.players && chunk.meta.players.length === 0)
	{
		delete chunk.meta.players;
	}
	for(const key in chunk) {
		if(key !== 'meta') {
			const splitUp = key.split('|');
			const x = parseInt(splitUp[0]);
			const y = parseInt(splitUp[1]);
			if(chunk[key]) for(const obj of chunk[key]) {
				if(obj.public.x === x) {
					delete obj.public.x;
				}
				if(obj.public.y === y) {
					delete obj.public.y;
				}
			}
		}
	}
}