type btn = {
	for: string,
	text: string,
	req: boolean,
	reqItems?: {id: string, title:string, count:number}[],
	reqConsume?: boolean,
	reqForAll?: boolean,
	reqTarget?: string,
	lock?: boolean,
	lockTarget?: string,
	hide?: boolean
} | 'leave';

export type room = {// text room
	id: string,
	title: string,
	body: string,
	visitedBody: string | 'clone',
	visitTarget?: string,
	btns: btn[]
} | {// loot room
	id: string,
	title: string,
	body: string,
	visitedBody: string | 'clone',
	loot: true,
	nextId: string,
	size: number,
	lootTable:{
		id:string,
		min:number,
		max:number,
		chance:number
	}[]
};

export type eventData = {
	id: string,
	weight: number,
	rooms: {
		[key:string]:room,
		main:room
	}
};

export type eventTotal = {
	[key:string]:eventData[]
};