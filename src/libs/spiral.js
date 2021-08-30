/**
 * keeps going out in the 8 cardinal directions until cb returns true
 * @param {number} x
 * @param {number} y
 * @param {({x: number, y: number}) => boolean} cb 
 */
module.exports.loopOut = function(x, y, cb, attempts = Infinity) {
	if(cb({x, y}))return;
	let distance = 1;
	while(distance < attempts) {
		// n
		if(cb({x, y: y + distance}) === true)break;
		// ne
		if(cb({x: x + distance, y: y + distance}) === true)break;
		// e
		if(cb({x: x + distance, y}) === true)break;
		// se
		if(cb({x: x + distance, y: y - distance}) === true)break;
		// s
		if(cb({x, y: y - distance}) === true)break;
		// sw
		if(cb({x: x - distance, y: y - distance}) === true)break;
		// w
		if(cb({x: x - distance, y}) === true)break;
		// nw
		if(cb({x: x - distance, y: y + distance}))break;
		++distance;// according to coherent this saves a cpu cycle
	}
}