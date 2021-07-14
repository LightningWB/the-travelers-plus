/**
 * this is a small file with types and an easy way to get the plugin api. recommended to include this in your plugin folder for typescript
 */

import * as events from "events";

declare namespace utility
{
	export function randomString(len:number):string
	export function mergeObject(obj1:object, obj2:object):anyObject
	export function sleep(ms: number):Promise<any>
	export type anyObject = {[key:string]:any};
	type dir = 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw';
	export function compassChange(x:number, y:number, dir:dir, magnitude:number):{x:number, y:number}
	/**
	 * checks if two objects are compatible adn returns true if they are equal
	 * 
	 * undefined values are ignored
	 * @param obj1 object 1
	 * @param obj2 object 2
	 * @param prop property name to check
	 * @returns boolean
	 */
	export function checkProp(obj1:object, obj2:object, prop:string):boolean
	export function cloneArray(arr:Array<any>):Array<any>
	export function clone(object:anyObject):typeof object
	export const root: string;
	type level = 'ERROR' | 'WARN' | 'INFO';
	export function debug(mode:level, message: string): void
	export function rand(min: number, max: number): number
}

declare namespace chunk
{
	export type obj = {
		public: {
			x: number,
			y: number,
			char: string,
			is_door: boolean,
			is_breakable: boolean,
			walk_over: false
		} & utility.anyObject,
		private: utility.anyObject
	} |  string
	// keys are x|y to be more memory and processor efficient
	export type chunk = {
		[key:string]:obj[],
		/**
		 * list of player usernames
		 */
		players:string[]
	}
}

declare namespace player
{
	export type playerData = {
		/**
		 * data free to see to the client
		 */
		public: {
			username: string,
			x: number,
			y: number,
			state: string
		} & utility.anyObject,
		/**
		 * data not available to the client like anchor coords and such
		 */
		private: {
			id: number
		} & utility.anyObject,
		/**
		 * data to get cleared every cycle, but still gets sent to the client. useful for stuff like engine logs.
		 */
		temp?: utility.anyObject,
		/**
		 * data stored in run time, but not saved to the db
		 */
		cache?: utility.anyObject
		addPropToQueue(...string):any
		sendMidCycleCall(data:utility.anyObject):any
	}
}

/**
 * plugins
 */
declare namespace plugins
{
	export const SAVE_INTERVAL:number;
	export namespace players
	{
		export type player = player.playerData
		/**
		 * gets a target player based on the username
		 * @param username username of the target player
		 * @returns the player
		 */
		export function getPlayerByUsername(username: string): player.playerData
		export function isPlayerOnline(username: string): boolean
		export function getOnlinePlayer(username: string): player.playerData
	}
	export namespace chunks
	{
		/**
		 * gets an object at a given set of coords
		 * @param x x value of object
		 * @param y y value of object
		 */
		export function getObject(x:number, y:number):chunk.obj
		/**
		 * gets all objects at a given set of coords
		 * @param x x value of object
		 * @param y y value of object
		*/
		export function getObjects(x:number, y:number):chunk.obj[]
		/**
		 * gets a chunk at given coordinates
		 * @param x 
		 * @param y 
		 * @returns 
		 */
		export function getChunk(x:number, y:number):chunk.chunk|boolean
		/**
		 * gets a chunk at given coordinates
		 * @param x 
		 * @param y 
		 * @returns 
		 */
		export function getChunkFromChunkCoords(x:number, y:number):chunk.chunk|boolean
		export function addObject(x:number, y:number, pub:utility.anyObject, priv: utility.anyObject):void
		export function removeObject(x:number, y:number):void
		export function unLoadChunk(x:number, y:number):void
		export function loadChunk(x:number, y:number):void
		/**
		 * saves a chunk from x and y values
		 * @param x chunk x
		 * @param y chunk y
		 */
		export function saveChunk(x:number, y:number):void
		export function isChunkLoaded(x:number, y:number):boolean
		export function isChunkCoordsLoaded(x:number, y:number):boolean
		export function getLoadedChunks():string[]
		export function isObjectHere(x:number, y:number):boolean
		export function toChunkCoords(x:number, y:number):{x:number, y:number}
	}
	export const util: typeof utility;
	export const options: utility.anyObject;
	// dummy class to allow type definitions
	class plugin
	{
		id: string;
		private parent: events.EventEmitter;
		constructor(parent: events.EventEmitter)
		on(event: 'chunkSave', listener: (chunk:chunk.chunk) => any, priority:number):any
		on(event: 'disconnect', listener: (player:player.playerData) => any, priority:number):any
		on(event: 'gameTickPre', listener: () => any, priority:number):any
		on(event: 'gameTick', listener: () => any, priority:number):any
		on(event: 'loadChunk', listener: (chunk:chunk.chunk) => any, priority:number):any
		on(event: 'playerConnect', listener: (player:player.playerData) => any, priority:number):any
		on(event: 'playerCreate', listener: (player:player.playerData) => any, priority:number):any
		on(event: 'playerReady', listener: (player:player.playerData) => any, priority:number):any
		on(event: 'playerSave', listener: (player:player.playerData) => any, priority:number):any
		on(event: 'playerTick', listener: (player:player.playerData) => any, priority:number):any
		on(event: 'saveChunk', listener: (chunk:chunk.chunk) => any, priority:number):any
		on(event: string, listener: (...args: any[])=>any, priority:number):any

		// pretty bad copy pasting but not too bad
		once(event: 'chunkSave', listener: (chunk:chunk.chunk) => any, priority:number):any
		once(event: 'disconnect', listener: (player:player.playerData) => any, priority:number):any
		once(event: 'gameTickPre', listener: () => any, priority:number):any
		once(event: 'gameTick', listener: () => any, priority:number):any
		once(event: 'loadChunk', listener: (chunk:chunk.chunk) => any, priority:number):any
		once(event: 'playerConnect', listener: (player:player.playerData) => any, priority:number):any
		once(event: 'playerCreate', listener: (player:player.playerData) => any, priority:number):any
		once(event: 'playerReady', listener: (player:player.playerData) => any, priority:number):any
		once(event: 'playerSave', listener: (player:player.playerData) => any, priority:number):any
		once(event: 'playerTick', listener: (player:player.playerData) => any, priority:number):any
		once(event: 'saveChunk', listener: (chunk:chunk.chunk) => any, priority:number):any
		once(event: string, listener: (...args: any[])=>any, priority:number):any

		emit(event: string, ...args: any[]):any
		addAdminButton(id:string, text: string, onSend: Function):any
		addAdminText(id:string, placeHolder: string, text: string, onSend: Function):any
	}
	export function makePlugin(id:string):plugin
	export function triggerEvent(event: string, ...args):void
	export function emit(namespace: string, method: string, ...args):void
	export function generateTileAt(x:number, y:number):string
}

export = plugins;