const { chunks, emit, triggerEvent, players, SAVE_INTERVAL } = require('./bullet')

let turn = 0;
let activeChunks = [];

/**
 * @param {import('../../player').playerData} player 
 */
module.exports.tick = function(player)
{
	// loading chunks
	const {x: chunkX, y: chunkY} = chunks.toChunkCoords(player.public.x, player.public.y);
	const meX = player.public.x;
	const meY = player.public.y;
	const me = player;
	player.temp.proximity = {};
	for(let x = chunkX - 1; x <= chunkX + 1; x++)
	{
		for(let y = chunkY - 1; y <= chunkY + 1; y++)
		{
			// player chunk lists
			const chunk = chunks.getChunkFromChunkCoords(x, y);
			if(chunk && chunk.meta.players === undefined)chunk.meta.players = [];
			if(chunk && x === chunkX  && y === chunkY && !chunk.meta.players.includes(player.public.username))chunk.meta.players.push(player.public.username);
			if(!chunks.isChunkCoordsLoaded(x, y))
			{
				chunks.loadChunk(x, y);
			}
			const ps = [];
			if(chunk) for(const username of chunk.meta.players)
			{
				if(username !== me.public.username)
				{
					const player = players.getPlayerByUsername(username);
					if(
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
		player.temp.proximity.objs = proximity;
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
}

module.exports.chunkUnload = function(chunk) {
	if(chunk.meta.players.length === 0)
	{
		delete chunk.meta.players;
	}
}