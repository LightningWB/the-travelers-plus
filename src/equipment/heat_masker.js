module.exports.canScan = function(_scanner, target, out) {
	if(out.get() === true && target.public.equipped === 'heat_masker') {
		out.set(false);
	}
}