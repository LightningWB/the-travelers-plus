const {emit, players, util, chunks, options, generateTileAt} = require('./bullet');
const { addEventTile, placeEvent } = require('./events');
const { item } = require('./supplies');

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.equip = function(packet, player) {
	if(player.public.state === 'travel')
	{
		if(typeof packet.item === 'string')
		{
			const i = item(packet.item);
			if(i && i.func && player.private.supplies[packet.item] &&
			player.private.supplies[packet.item] > 0)
			{
				player.public.equipped = packet.item;
				player.addPropToQueue('equipped');
			}
		}
	}
}

module.exports.dequip = function(packet, player) {
	if(player.public.state === 'travel' && player.public.equipped)
	{
		emit('equip_actions', player.public.equipped + '::dequip', player);
		player.public.equipped = undefined;
	}
}

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.equipment = function(packet, player) {
	if(
		player.public.state === 'travel' &&
		player.public.equipped &&
		item(player.public.equipped).func_actions[packet.option] &&
		player.private.supplies[player.public.equipped] &&
		player.private.supplies[player.public.equipped] > 0
	){
		emit('equip_actions', player.public.equipped + '::' + packet.option, player);
	}
}