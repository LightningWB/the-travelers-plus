const {emit, players, util, chunks} = require('./bullet');
let plugin;
module.exports.plugin = (p)=>plugin = p;

/**
 * @param {players.player} player 
 */
 module.exports.join = function(player) {
	player.addPropToQueue('*');// just a good idea to set everything to send when they join
	player.message = function(id, cb, size = Infinity) {// the message popups for stuff like signs
		let fulfilled = false;
		function tryToGetUser() {
			plugin.once('actions::genmsg', (packet, p)=>{
				if(fulfilled)return;
				if(player.public.username === p.public.username)
				{
					if(id === packet.option)cb(packet.text.substring(0, size));// other stuff can be ignored
					fulfilled = true;
				}
				else
				{
					tryToGetUser();
				}
			});
		}

		function addAllAction()
		{
			plugin.once('actions::*', (packet, p)=>{
				if(fulfilled)return;
				if(player.public.username === p.public.username)
				{
					if(packet.action && packet.action !== 'genmsg')fulfilled = true;
					else addAllAction();
				}
				else addAllAction();
			});
		}
		setTimeout(()=>{
			addAllAction();
			tryToGetUser();
		}, 0);
	}
}

/**
 * @param {players.player} player 
 */
module.exports.create = function(player) {
	player.public.x = util.rand(-500, 500);
	player.public.y = util.rand(-500, 500);
}

module.exports.eventLog = function(message, player, ) {
	if(!player.temp.exe_js)player.temp.exe_js = '';
	player.temp.exe_js += "ENGINE.log('" + message + "', false);";
	player.addPropToQueue('exe_js');
}

module.exports.eventLogEscape = function(message, player) {
	const xssReplace = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'\'': '&#39;',
		'"': '&quot;',
		'/': '&#x2F;',
		"\\": '&#92;',
		"\n": '&#92;n'
	};
	emit('travelers', 'eventLogUnsafe', message.replace( /[&<>'"/\\\n]/g, char => xssReplace[char]).replace(/&#92;n/g, '<br />'), player);
}