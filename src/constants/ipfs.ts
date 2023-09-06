const DEFAULT_PINATA_GATEWAY = 'gateway.pinata.cloud';

// TODO: get env variables from .env file, rollup plugin
const IPFS_GATEWAY_HOSTNAME = (
	(import.meta.env.VITE_PINATA_GATEWAY_HOSTNAME as string) || DEFAULT_PINATA_GATEWAY
).replace(/https?:\/\//g, '');

export const IPFS_TAGS = {
	METADATA:
		process.env.NODE_ENV === 'production'
			? 'juicebox_project_metadata'
			: 'DEV_juicebox_project_metadata',
	LOGO:
		process.env.NODE_ENV === 'production' ? 'juicebox_project_logo' : 'DEV_juicebox_project_logo',
	NFT_REWARDS:
		process.env.NODE_ENV === 'production'
			? 'juicebox_nft_reward_tier'
			: 'DEV_juicebox_nft_reward_tier',
	SNAPSHOT_SETTINGS:
		process.env.NODE_ENV === 'production'
			? 'juicebox_snapshot_settings'
			: 'DEV_juicebox_snapshot_settings',
	NFT_REWARDS_COLLECTION_METADATA:
		process.env.NODE_ENV === 'production'
			? 'juicebox_nft_reward_tier_collection'
			: 'DEV_juicebox_nft_reward_tier_collectionr',
};

// Gets strings that start with 'ipfs'
export const IPFS_LINK_REGEX = new RegExp(
	/((?:ipfs?):\/\/(?:\w+:?\w*)?(?:\S+)(:\d+)?(?:\/|\/([\w#!:.?+=&%!\-/]))?)/gi,
);

export enum PinningState {
	PENDING = 'pending',
	PINNING = 'pinning',
	DONE = 'done',
	FAILED = 'failed',
}

export { IPFS_GATEWAY_HOSTNAME as default };
