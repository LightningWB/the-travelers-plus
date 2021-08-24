const { chunks } = require('./bullet');
const DELETE_ITEMS = ['wood_stick', 'scrap_metal', 'steel_shard', 'copper_ore'];
const BONUS_ITEMS = ['plastic', 'bullet', 'cloth'];

const TOTAL_ITEMS = DELETE_ITEMS.concat(BONUS_ITEMS);

const DELETE_COUNT = 11;

/**
 * determines if a hole object should be saved
 * @param {object} obj 
 */
function isValidHole_0(obj)
{
	if(typeof obj.private !== 'object' || typeof obj.private.eventData !== 'object' || typeof obj.private.eventData.loot !== 'object')return false;
	const loot = obj.private.eventData.loot.main;
	const keys = Object.keys(loot).filter(e=>loot[e]);
	if(keys.length === 0)return false;
	if(keys.length > 2)return true;
	let found = 0;
	for(const item of keys)
	{
		if(TOTAL_ITEMS.includes(item) && loot[item] < DELETE_COUNT + 1)
		{
			found++;
		}
	}
	return found < keys.length;
}

/**
 * determines if a hole should be saved based on coordinates
 * @param {number} x 
 * @param {number} y 
 */
function isValidHole_1(x, y)
{
	return isValidHole_0(chunks.getObject(x, y));
}

/**
 * checks if a hole should be saved or not
 * @param {number|object} o 
 * @param {number} y 
 * @returns 
 */
function isValidHole(o, y)
{
	if(arguments.length === 2)
	{
		return isValidHole_1(arguments[0], arguments[1]);
	}
	else return isValidHole_0(arguments[0]);
}

module.exports.isValidHole = isValidHole;

module.exports.unloadChunk = function(chunk) {
	const keys = Object.keys(chunk);
	for(const key of keys)
	{
		if(key !== 'meta')
		{
			if(chunk[key])// check to make sure the object isn't null/undefined
			{
				const obj = chunk[key][0];
				if(obj.private && obj.private.eventData && obj.private.eventData.type === 'hole')
				{
					if(!isValidHole(obj))
					{
						delete chunk[key];
					}
				}
			}
		}
	}
}