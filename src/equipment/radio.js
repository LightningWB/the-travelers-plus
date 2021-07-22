const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

function addStatusText(player)
{
	player.temp.equip_data = {
		status_text: player.private.radio !== undefined ? ('active. channel: ' + (player.private.radio.channel || 'unencrypted global.') ): ''
	};
	player.addPropToQueue('equip_data');
}

module.exports.connect = function(player) {
	if(player.private.radio)addStatusText(player);
}

module.exports.radio_toggle = function(player) {
	if(player.private.radio)
	{
		player.private.radio = undefined;
		emit('travelers', 'eventLog', 'radio deactivated', player);
	}
	else
	{
		player.private.radio = {
			channel: ''
		};
	}
	addStatusText(player);
}

module.exports.radio_transmit = function(user) {
	if(user.private.radio)
	{
		user.message('radio_transmit', m=>{
			m = m.replace(/\n/g, '');
			for(const player of players.onlinePlayers())
			{
				if(player.private.radio && player.private.radio.channel === user.private.radio.channel)
				{
					emit('travelers', 'eventLog', (player === user ? 'broadcasted transmission:\n' : 'received transmission:\n') + m, player);
				}
			}
		}, 100);
	}
}

module.exports.radio_setchannel = function(player) {
	if(player.private.radio)
	{
		player.message('radio_set_channel', m=>{
			player.private.radio.channel = m;
			emit('travelers', 'eventLog', 'set radio encryption channel to: ' + m, player);
			addStatusText(player);
		}, 9);
	}
}