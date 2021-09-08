const { emit, generateTileAt, chunks } = require("../bullet");

module.exports.canPlayerMoveOnTile = function(player, tile, out) {
	if(!out.get()) {
		if(player.public.equipped === 'boat' && tile === 'w') {
			out.set(true);
		}
	}
}

module.exports.unequip = function(packet, player) {
	if(player.public.equipped === 'boat' && generateTileAt(player.public.x, player.public.y) === 'w' && !chunks.isObjectHere(player.public.x, player.public.y)) {
		emit('travelers', 'killPlayer', player);
		player.public.equipped = undefined;
		return false;
	}
}