const fs = require('fs');
const { join } = require('path');
const thetravelers = require('./bullet');
/**
 * 
 * @param {import('./bullet.js').plugin} plugin 
 */
module.exports = function(plugin) {
	plugin.addHowToPlaySection('intro', [
		// any strings with double quotes are to save me time
		{
			type: 'text',
			content: "The Travelers is an MMO, but it's mostly an idle game. Don't try to constantly play it, it'll get boring fast. Use the game's automatic tools to play for you while away, and use notifications to let you know when something interesting happens. The world is massive, and most of it is empty, so enjoy it in pieces instead of sessions."
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'The community objective is to solve the worldwide puzzle hidden in the game. Start at the center of the world. When you get to (0, 0) you will find something that will lead you to the first clue. The puzzle is extremely difficult and will take many players a long time to solve. Rest assured, every stage is solvable and fair.',
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'When you first start playing The Travelers, you are offered a tutorial. This how-to-play page will assume you skipped the tutorial, since most people will either skip it or gloss over it anyway.'
		},
		{type: 'lineBreak'}
	]);
	
	plugin.addHowToPlaySection('the map', [
		{
			type: 'text',
			content: 'The map displays the world as far as you can see, up to 15 tiles (kilometers) away. Each tile represents what the region consists of; it could be ash, trees, swamp, and more. Your biome is indicated under the tracker above the map. If you don\'t know what a tile is, you can hover over it with your mouse to view a description of it.'
		},
		{
			type: 'img',
			data: fs.readFileSync(join(__dirname, 'assets/htp_map.png'))
		}
	]);
	
	plugin.addHowToPlaySection('movement', [
		{
			type: 'text',
			content: 'The first thing that puts off most players is how the arrow keys work. When you click one, the movement isn\'t instant; the motion will be queued, and applied at the end of the current cycle. You can view the cycle timer at the top of the screen. A cycle lasts ' + (1/thetravelers.options.tps).toFixed(1) + ' second' + (thetravelers.options.tps === 1 ? '' : 's') + '.'
		},{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_cycles.png'))},
		{
			type: 'text',
			content: 'If you press the same arrow key before the cycle ends, it will undo the movement. You can auto-walk by clicking "auto" in the center of the arrows, and then pressing a direction. You\'ll auto-walk until you hit something or disconnect. You can also use the arrow keys or numpad keys to activate the arrow buttons.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_arrows.png'))},
		{
			type: 'text',
			content: 'If you want to auto-walk without being stopped by events, you can go to your game settings in the menu and enable "auto-walk past events", and set an amount of cycles to delay automatically leaving.'
		},
		{type: 'lineBreak'}
	]);
	
	plugin.addHowToPlaySection('event log menu', [
		{
			type: 'text',
			content: 'The Event Log will describe everything happening in the game. If you do something and are unsure about if anything happened, a description will probably be there. You\'ll find updates about the time and weather, whether other travelers are nearby, and other handy notices.'
		},{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_eventlog.png'))}
	]);
	
	plugin.addHowToPlaySection('stats menu and xp', [
		{
			type: 'text',
			content: "Your stats menu contains XP elements like your level, health, stamina, and base damage level. Your health and stamina constantly increase by 1 until full over time if you have no modifying effects."
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_you.png'))},
		{
			type: 'text',
			content: 'When you level up, you can click "upgrade" in the box that appears to increase your maximum health, stamina, carry capacity, or base damage. 1 skill point can be worth varying amounts depending on the bar you want to upgrade. The "x10" buttons will apply 10 skill points (or as many as you have available), and the "reset" button will reset any upgrades you hadn\'t yet confirmed.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_upgrade.png'))},
		{
			type: 'text',
			content: 'The "reset all skill points" button is self-explanatory. It will cost you 10% of your levels (rounded up if it\'s not an even number) and asks for confirmation. The "commit suicide" button will kill you instantly wherever you stand, and also asks for confirmation.'
		},
		{type: 'lineBreak'}
	]);
	
	plugin.addHowToPlaySection('supplies', [
		{
			type: 'text',
			content: "The Supplies menu will display your carry capacity and every item you have. You can sort by name or count, and if you don't like the default icon view, you can change it in the game settings in the menu."
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_supplies.png'))},
		{
			type: 'text',
			content: 'Clicking on an item will reveal its options and description. If it is a blueprint, you can learn it, or if it is an equippable item, you can equip it.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_suppdesc.png'))}
	]);
	
	plugin.addHowToPlaySection('equipment and building', [
		{
			type: 'text',
			content: 'Equipping an item will make a window appear next to the arrow keys. This window will display all the options an item has, and describe what they do.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_equip.png'))},
		{
			type: 'text',
			content: 'If the equipped item is a building material, it will show a tiny map based on the tiles around your character. Clicking one will place your item on that tile. Building materials cannot be picked up once placed, and can only be destroyed permanently.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_build.png'))},
		{
			type: 'text',
			content: 'If the equipped item is used to destroy placed building materials, the tiles in the mini-map will be used to destroy it. Different items can take different amounts of time to break materials, but generally, building materials take a very long time to break. If you have no tools, you can use the "dismantle" button in the hotbar to destroy nearby building materials.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_break.png'))},
		{
			type: 'text',
			content: 'Walls and doors cannot be placed too close to each other within 1000km of the world center. If, when you try to place a wall or door, the game counts more than 50 walls or doors within a 60km radius, the item will not be placed on the ground. Similarly, for signs, within 500km of the world center, if there are more than 100 signs within a 50km radius, the sign will not be placed.'
		}
	]);
	
	plugin.addHowToPlaySection('crafting', [
		{
			type: 'text',
			content: "The Crafting menu will show all the items you have available to craft. Every 5-10 levels you will unlock new items to craft, and learning an item with a blueprint will permanently add it to your crafting tree. If you have the necessary supplies to craft an item, it will show fully, otherwise it will be slightly faded out. If you don't like the icon view, you can change it in the game settings in the menu."
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_craft.png'))},
		{
			type: 'text',
			content: 'Clicking a crafting item will open a menu that fully describes the item and lists its stats. If you have the supplies to craft it, the "craft" button will not be faded out.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_craftnow.png'))},
		{
			type: 'text',
			content: 'You can craft as many items at once as you want, and can cancel them anytime before their countdowns run out. When you click "craft", the items will be removed from your inventory immediately, but will be given back if you cancel.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_crafting.png'))}
	]);
	
	plugin.addHowToPlaySection('hotbar', [
		{
			type: 'text',
			content: "The hotbar is for general-use buttons that don't fit anywhere else. New buttons can appear or disappear depending on where you stand."
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'The "double-step" button will cause you to take 2 steps in any direction at the cost of 10 stamina, but is unavailable in certain biomes.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'The "step limit" function can be used in tandem with auto-walking to make you stop after a certain number of steps.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'The "drop items" button will open a looting window so you can leave items you don\'t need on the ground.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'The "dismantle" button will only appear when standing next to a building material, and is used for destroying building materials without a specific destructive item.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'The "collect wood" button appears when you stand on top of a tree, and will cause the tree to disappear after you take its wood (which awards 2-4 wooden planks).'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_hotbar.png'))}
	]);
	
	plugin.addHowToPlaySection('events and looting', [
		{
			type: 'text',
			content: 'In your travels, you will find interesting locations. To enter one, simply walk on top of it.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_city.png'))},
		{
			type: 'text',
			content: 'You will be presented with a description of your location, and options to navigate through the event. A story is being told, so read carefully. If you can see the bold "exit event" button, then you can leave the event and return to the map. If you do not see the button, then you are being forced to make a choice. There\'s no backing out, so choose wisely. If you exit an event and decide you want to re-enter it, you can use the "enter event" button that appears on the hotbar.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_event.png'))},
		{
			type: 'text',
			content: 'Sometimes during events you can find places where you can collect supplies. To take items, click the "+1" or "+10" buttons in the "available loot" column, the items will be moved into your inventory, which is displayed on the left. If another player is looting that spot at the same time, you\'ll see the items update. If you try to take more than your carry capacity, or if you try to give more than the loot path is capable of holding, the item will blink and say "limit reached". The "take all" button can be used to take all the available loot that you can hold. You can also sort by weight, count, or name.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_loot.png'))}
	]);
	
	plugin.addHowToPlaySection('status effects', [
		{
			type: 'text',
			content: 'Status effects are condition-based modifiers that can affect gameplay in certain ways. Currently, there are only two status effects. You can view extra info about status effects by hovering your mouse over them.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'Overencumbered: When you end up holding more weight than your maximum carry capacity, you become Overencumbered. This can happen in a few ways, such as crafting a heavy item or resetting your skills. To undo this, you must drop items or upgrade your maximum carry capacity. If you stay overencumbered, you will gradually lose stamina, and at 0 stamina you will be unable to move. You can still move freely within protection zones or when on top of event locations, though.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'Constitution: When in an interaction, if you have Constitution, other players will not be able to surprise-attack you. If they wish to fight, they can only offer a challenge. You still can surprise attack anyone without Constitution, though. If you are breaking a structure while an interaction begins, the effect will be reduced to 0 immediately. Constitution is a time-based modifier, and only decrements while traveling freely.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_effects.png'))}
	]);
	
	plugin.addHowToPlaySection('player interactions', [
		{
			type: 'text',
			content: 'If two travelers walk onto the same tile, an interaction window will pop up. Here you can talk to the other player(s) if they are online. If a player is online, you can attack or challenge them to initiate a battle. You are not allowed to leave an interaction until 5 seconds after joining.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_intonline.png'))},
		{
			type: 'text',
			content: 'If a player is offline, you can choose to leave them a message, loot them, or kill them. If you loot or kill, and there are other online players currently in the interaction, it will let them know with a message in the chat.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_intoffline.png'))}
	]);
	
	plugin.addHowToPlaySection('battles', [
		{
			type: 'text',
			content: 'When you\'re in an interaction with another online player, you have the option to attack and force both of you into a battle. When the battle ends, the loser will die and the winner will receive an XP reward based on the level difference. If your opponent is a lower level than you, your reward will not be great; but if they are higher than you, the reward will be bountiful. Pick your fights wisely.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'If you\'re within a protection zone, the button will say "challenge", and the other player will have to accept the challenge to begin the battle. Outside of protection zones, though, this consent is not required. Only two players can battle at once; other players in an interaction can\'t attack or challenge two that are already battling. When a battle ends, the victor will be restored to full health, so that if others in the interaction wish to attack them, it\'ll be a fair fight.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'When a battle begins, the first screen will display all your available weapons. If you choose, you can also fight with your bare hands. When you click "ready", your weapon will be permanently selected for the duration of the battle. When both players are ready, or when the 60 second countdown finishes, the battle will begin.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_prebattle.png'))},
		{
			type: 'text',
			content: 'Battles take place in rounds. Both players select an attack or defense, and depending on what both options are, health and stamina reduction will be dealt. Rounds continue until one player has reached 0 health. You spend the weapon\'s given stamina cost by using offensive options, and gain 10 stamina if you use a defensive options. If you lose all of your stamina, you will skip a turn, allowing the opponent to hit you freely. If both players choose the same attack option, a parry will occur, which doesn\'t actually do anything except indicate the same choice was made. Total damage for an attack is calculated based on your base damage plus the weapon\'s additional damage modifier.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_battleround.png'))},
		{
			type: 'text',
			content: 'Heavy Attack deals double damage, at the cost of double stamina. It will beat Block and an Attack in either direction, but misses a Dodge in either direction.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'Attack Left and Attack Right deal basic damage, at the cost weapon\'s stamina reduction. It will beat a Dodge in the same direction, but miss Heavy Attack, Block, or a Dodge in the opposite direction.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'Block will stop either directional Attack, but lose to the Heavy Attack. You gain 10 stamina for Block, but not if you take damage.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'Dodge Left and Dodge Right avoid Heavy Attack and a basic attack in the opposite direction. You gain 10 stamina for Dodge, but not if you take damage.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'You can also choose to do nothing, which is known as "abstaining". If you abstain, you will gain 10 stamina regardless of if you take damage from your opponent that round.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_battlehit.png'))},
		{
			type: 'text',
			content: 'If both players abstain from attacking for 10 rounds in a row, the battle will automatically end.'
		},
		{type: 'lineBreak'},
		{
			type: 'text',
			content: 'At the end of a battle, you get 30 seconds to speak to your opponent before the battle ends. You can choose to execute them anytime before the 30 seconds ends too.'
		},
		{type: 'img', data: fs.readFileSync(join(__dirname, 'assets/htp_battlewin.png'))}
	]);
}