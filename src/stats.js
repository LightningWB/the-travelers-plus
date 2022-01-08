const { config } = require('.');
const {emit, players, util, chunks, options} = require('./bullet');

/**
 * default skill points
 */
const defaultSkillValues = {
	next_level_xp: 60,
	level: 0,
	xp: 0,
	carry: 0,
	dmg: 10,
	hp: 100,
	max_carry: 200,
	max_hp: 100,
	max_sp: 30,
	skill_points: 0,
	sp: 30
};

/**
 * amount to upgrade skill points by
 */
const skillUpgradeValues = {
	hp: 8,
	sp: 2,
	dmg: 1,
	carry: 25
};

/**
 * returns the number of xp needed to level up
 * (2x^2.75 + 20x + 20) * 3
 * @param {Number} l 
 * @returns xp
 */
function xpForLevel(l)
{
	return Math.ceil((2 * Math.pow(l, config.xp_exponential_rate)) + (config.xp_level_increase_rate * l) + 20) * 3;
}

/**
 * adds one to distance traveled stat
 * subtracts stamina if double stepped
 * adds xp for step traveled
 * @param {players.player} player 
 */
module.exports.onStep = function(player) {
	player.public.steps_taken++;
    
    if(player.cache.travelData && player.cache.travelData.dir && player.cache.doubleStep)
	{
		player.public.skills.sp-=10;
		player.addPropToQueue('skills');
	}
	if(player.cache.travelData.dir !== '')
	{
		player.public.skills.xp++;
		player.addPropToQueue('skills');
	}
}


/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.skill_upgrade = function(packet, player) {
	if(player.public.state === 'travel'
		&& typeof packet.hp === 'number'
		&& typeof packet.sp === 'number'
		&& typeof packet.dmg === 'number'
		&& typeof packet.carry === 'number'
	){
		const totalPoints = Math.abs(packet.hp) + Math.abs(packet.sp) + Math.abs(packet.dmg) + Math.abs(packet.carry);
		if(totalPoints <= player.public.skills.skill_points)
		{
			player.public.skills.max_hp += packet.hp * skillUpgradeValues.hp;
			player.public.skills.max_sp += packet.sp * skillUpgradeValues.sp;
			player.public.skills.dmg += packet.dmg * skillUpgradeValues.dmg;
			player.public.skills.max_carry += packet.carry * skillUpgradeValues.carry;
			player.public.skills.skill_points -= totalPoints;
			player.addPropToQueue('skills');
		}
	}
}

module.exports.resetLevel = function(player) {
	// drop player level by 10% and recalculate xp
	const resetLevel = Math.ceil((player.public.skills.level + 1) * (1 - config.death_xp_penalty)) - 1;
	const resetXp = xpForLevel(resetLevel - 1);
	const resetNextLevelXp = xpForLevel(resetLevel);

	player.public.skills.level = resetLevel;
	player.public.skills.xp = resetXp;
	player.public.skills.next_level_xp = resetNextLevelXp;
}

module.exports.travelersResetSkills = function(player, resetXp = false) {
	if(resetXp) {
		emit('travelers', 'resetLevel', player);
	}
	
	const { sp: currentSp, hp: currentHp, carry: currentCarry } = player.public.skills;
	player.public.skills = {
		...defaultSkillValues,
		level: player.public.skills.level,
		xp: player.public.skills.xp,// its reset earlier if needed so no problem here
		next_level_xp: player.public.skills.next_level_xp,
		skill_points: player.public.skills.level,
		sp: Math.min(currentSp, defaultSkillValues.sp),
		hp: Math.min(currentHp, defaultSkillValues.hp),
		carry: currentCarry
	}
	player.addPropToQueue("skills");

	// reset player crafting recipes with new level
	emit('travelers', 'renderCrafting', player);
}

/**
 * @param {object} packet
 * @param {players.player} player 
 */
module.exports.reset_skills = function(_packet, player) {
	emit('travelers', 'resetSkills', player, true);
}

/**
 * @param {players.player} player 
 */
module.exports.tick = function(player) {
	if(parseInt(player.public.skills.xp) !== player.public.skills.xp) {
		player.public.skills.xp = Math.ceil(player.public.skills.xp);
	}
	while(player.public.skills.xp >= player.public.skills.next_level_xp)
	{
		emit('travelers', 'levelUpPlayer', player);
	}
	if(player.public.state === 'travel')
	{
		if(player.public.skills.sp < player.public.skills.max_sp && player.public.skills.carry <= player.public.skills.max_carry)
		{
			player.addPropToQueue('skills');
			player.public.skills.sp++;
		}
		if(player.public.skills.hp < player.public.skills.max_hp)
		{
			player.addPropToQueue('skills');
			player.public.skills.hp++;
		}
	}
	if(player.public.skills.xp < 0) {
		player.public.skills.xp = 0;
	}
}

/**
 * @param {players.player} player 
 */
module.exports.levelUp = function(player) {
	player.public.skills.level++;
	player.public.skills.skill_points++;
	// I have no clue why toro designed it this way, but for the sake of keeping a frontend with no differences here it is
	player.public.skills.next_level_xp = xpForLevel(player.public.skills.level);
	player.addPropToQueue('skills');
}

/**
 * if you install this later or something
 * @param {players.player} player 
 */
module.exports.playerJoin = function(player) {
	// you have to clone here to stop everyone sharing a common skill set
	if(!player.public.skills)player.public.skills = util.clone(defaultSkillValues);
	if(!player.public.steps_taken)player.public.steps_taken = 0;
	emit('travelers', 'calcWeight', player);
}

/**
 * @param {players.player} player 
 */
module.exports.playerCreate = function(player) {
	player.public.skills = util.clone(defaultSkillValues);
}

module.exports.calcWeight = function(player) {
	let weight = 0;
	for(const item in player.private.supplies)
	{
		const itemData = {};
		emit('travelers', 'getItem', item, itemData);
		const amount = player.private.supplies[item] * itemData.weight;
		if(!isNaN(amount))weight += amount;
	}
	player.public.skills.carry = weight;
	player.addPropToQueue('skills');
}

module.exports.admin = function(plugin) {
	function mod(d, m){
		const splitUp = d.split(':');
		if(splitUp.length !== 2)return 'Invalid Parameters';
		splitUp[1] = Number(splitUp[1]);
		if(typeof splitUp[0] !== 'string' || typeof splitUp[1] !== 'number')return 'Invalid Parameters';
		if(splitUp[1] > 100000000)return 'Do you really need more than 100 million xp';
		if(!players.isPlayerOnline(splitUp[0]))return 'Invalid username or the player is offline';
		const player = players.getOnlinePlayer(splitUp[0]);
		player.public.skills.xp += splitUp[1] * m;
		player.temp.gained_xp = splitUp[1] * m;
		player.addPropToQueue('skills', 'gained_xp');
		return 'Successfully ' + (m>0 ? 'Added' : 'Removed') + ' XP';
	}
	plugin.addAdminText('givePlayerXP', 'Username:Amount', 'Give XP', (d)=>mod(d, 1));
	plugin.addAdminText('takePlayerXP', 'Username:Amount', 'Remove XP', (d)=>mod(d, -1));
}

module.exports.givePlayerXp = function(player, amount) {
	player.public.skills.xp += amount.get();
	player.temp.gained_xp = amount.get();
	player.addPropToQueue('skills', 'gained_xp');
}