const { config } = require('.');
const {emit, players, util, chunks} = require('./bullet');
const { placeEvent } = require('./events');
let plugin;
module.exports.plugin = (p)=>plugin = p;

/**
 * @param {players.player} player 
 */
 module.exports.join = function(player) {
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
			plugin.once('travelers::movePlayer', p => {
				if(fulfilled)return;
				if(p.public.username === player.public.username)
				{
					fulfilled = true;
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
	player.public.x = util.rand(-config.spawn_radius, config.spawn_radius);
	player.public.y = util.rand(-config.spawn_radius, config.spawn_radius);
	const {x, y} = player.public;
	const dir = util.rand(1, 4);
	const targetPos = {
		1: {x, y: y + 5},
		2: {x: x + 4, y},
		3: {x, y: y - 5},
		4: {x: x - 5, y}
	}[dir];
	placeEvent(targetPos.x, targetPos.y, 'u', 'backpack', 'backpack');
}

module.exports.eventLog = function(message, player, ) {
	emit('travelers', 'addExeJs', player, "ENGINE.log('" + message + "', false);");
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

module.exports.xssReplace = str => {
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
	return str.replace( /[&<>'"/\\\n]/g, char => xssReplace[char]).replace(/&#92;n/g, '<br />');
}

module.exports.addExeJs = function(player, js) {
	if(player.temp.exe_js === undefined) {
		player.temp.exe_js = js + ';';
		player.addPropToQueue('exe_js');
	} else {
		player.temp.exe_js += ';' + js + ';';// toro sends js this way so...
	}
}