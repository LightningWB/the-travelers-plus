export declare type structureData = {
	/**
	 * structure id
	 */
	id: string,
	/**
	 * item that places this structure
	 */
	placingItem: string,
	char: string,
	/**
	 * defaults to false
	 */
	isDoor?: boolean
	/**
	 * defaults to false
	 */
	isBreakable?: boolean,
	/**
	 * required if `isBreakable`
	 */
	breakTime?: number,
	/**
	 * defaults to false
	 */
	standOver?: boolean,
	/**
	 * defaults to true
	 */
	walkOver?: boolean,
	// if either event thing is undefined no player interactivity
	/**
	 * the variation id of the event
	 */
	eventId?: string,
	/**
	 * the type of event
	 */
	eventType?: string
}

export declare type fullData = {
	// indexed by id
	[key:string]: structureData
}