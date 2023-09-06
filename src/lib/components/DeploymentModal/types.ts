export type Action = () => Promise<void>;
export type ActionMap = {
	[key: number]: Action;
};
