export type Duration = 1 | 7 | 30 | 90 | 365;

export type EventRef = {
	timestamp: number;
	value?: number;
};

export type BlockRef = { block: number | null; timestamp: number };

// key of type string and value of type EventRef
export type CachedEventRef = {
	[key: string]: { events: EventRef[]; cachedAt: number };
};
