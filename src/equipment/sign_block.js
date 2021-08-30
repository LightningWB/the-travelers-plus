const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

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
const xssOut = str => str.replace( /[&<>'"/\\\n]/g, char => xssReplace[char]).replace(/&#92;n/g, '<br />');
/**
 * @param {object} _sign 
 * @param {players.player} player 
 */
module.exports.signPlaced = function(sign, player) {
	emit('travelers', 'addExeJs', player, "MSG.open('', 'write a message for your sign.', 200, 'write message', 'cancel', 'add_sign');")
	player.message('add_sign', m => {
		m = xssOut(m);
		sign.private.message = m;
	}, 200);
}

/**
 * @param {players.player} player 
 */
module.exports.calcPlayerEvent = function(player) {
	if(player.private.eventData.type === 'sign') {
		const obj = chunks.getObject(player.public.x, player.public.y);
		let newMessage;
		if(obj.private.message) {
			newMessage = player.temp.event_data.stage_data.desc.replace('MESSAGE', obj.private.message);
		} else {
			newMessage = 'a wooden board, hastily nailed to a pole driven into the ash, but bears no message.';
		}
		player.temp.event_data.stage_data.desc = newMessage;
	}
}