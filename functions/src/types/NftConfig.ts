import type { PinataPinResponse } from 'pinata_ipfs_sdk';
import type { DropzoneOutput } from './Dropzone';

export enum BlockchainType {
	ETHEREUM = 'ethereum',
	TEZOS = 'tezos',
}

export enum BoostType {
	number = 'boost_number',
	percentage = 'boost_percentage',
}

export enum PfpConstraintType {
	NONE,
	COUNT,
	PERCENTAGE,
}

export enum NftType {
	IMAGE = 'Image',
	MUSIC = 'Music',
	VIDEO = 'Video',
	P5JS = 'p5.js',
	PFP = 'PFP',
}

export enum PlaybackType {
	ONCE = 'Once',
	TIMES = 'Times',
	REPEAT = 'Repeat',
}

export enum CaptureType {
	RESTART = 'Restart',
	DELAY = 'Delay',
}

export enum NftStatus {
	UNFINISHED,
	SAVED,
}

export interface Attribute {
	name: string;
	value: string;
}

export interface NumericAttribute extends Attribute {
	max: string;
}
export interface Boost extends Attribute {
	type: BoostType;
}

export interface TrackInfo {
	_id?: string;
	_status?: NftStatus;
	name: string;
	artist: string;
	file: string;
	isSunvox?: boolean;
	playback: {
		type: PlaybackType;
		value: string;
	};
}

export interface MusicPopulation {
	_id?: string;
	_status?: NftStatus;
	name: string;
	amount: number;
	tracks: TrackInfo[];
	cover?: string;
	file?: DropzoneOutput | string;
}
export interface PfpProperty {
	_id?: string;
	name: string;
	fileName: string;
	file: DropzoneOutput;
	constraint: {
		type: PfpConstraintType;
		value: number;
	};
}
export interface PfpAttribute {
	_id?: string;
	_status?: NftStatus;
	name: string;
	properties: PfpProperty[];
}
export interface PfpPopulation {
	_id?: string;
	_status?: NftStatus;
	name: string;
	amount: string;
	defaultColor: string[];
	attributes: PfpAttribute[];
	seed?: string;
	ipfs?: PinataPinResponse[];
}

export interface Attributes {
	properties: Attribute[];
	levels: NumericAttribute[];
	stats: NumericAttribute[];
	boosts: Boost[];
}

export interface NftConfig {
	_id: string;
	_type: NftType;
	_status?: NftStatus;
	_token: string;
	name: string;
	symbol: string;
	description: string;
	external_link: string;
	total_supply: number;
	blockchain: BlockchainType;
	default_color: string;
	attributes?: Attributes;
	unlockable_content: boolean;
	sensitive_content: boolean;
	freeze_metadata: boolean;
	population:
		| ImagePopulation[]
		| MusicPopulation[]
		| VideoPopulation[]
		| P5Population[]
		| PfpPopulation[];
	ipfsMetadata?: any;
}

export interface ImagePopulation {
	file: DropzoneOutput | string;
	output_resolution: string;
}

export interface ImageNftConfig extends NftConfig {
	population: ImagePopulation[];
}

export interface MusicNftConfig extends NftConfig {
	population: MusicPopulation[];
	ipfs?: PinataPinResponse;
}

export interface VideoPopulation {
	file?: DropzoneOutput | string;
	cover?: string;
	playback: {
		type: PlaybackType;
		value: string;
	};
	output_resolution?: string;
}

export interface VideoNftConfig extends NftConfig {
	population: VideoPopulation[];
}

export interface P5Population {
	script: string;
	previewImage: string;
	capture: {
		type: CaptureType;
		delay: string;
		repeat: string;
	};
	output_format: {
		type: string;
		format: string;
	};
	playback: {
		type: PlaybackType;
		value: string;
	};
	output_resolution: string;
	file?: DropzoneOutput | string;
}

export interface P5NftConfig extends NftConfig {
	population: P5Population[];
}

export interface PfpNftConfig extends NftConfig {
	population: PfpPopulation[];
}

export const initialMusicPopulation: MusicPopulation = {
	_status: NftStatus.UNFINISHED,
	name: '',
	amount: 0,
	tracks: [],
	cover: '',
};
export const initialTrack: TrackInfo = {
	_status: NftStatus.UNFINISHED,
	name: '',
	artist: '',
	file: '',
	isSunvox: false,
	playback: {
		type: PlaybackType.ONCE,
		value: '',
	},
};

export const initialNftConfig: NftConfig = {
	_id: '',
	_type: undefined,
	_status: NftStatus.UNFINISHED,
	_token: '',
	name: '',
	symbol: '',
	description: '',
	external_link: '',
	total_supply: 1,
	population: [],
	blockchain: BlockchainType.ETHEREUM,
	default_color: '',
	attributes: {
		properties: [],
		levels: [],
		stats: [],
		boosts: [],
	},
	unlockable_content: false,
	sensitive_content: false,
	freeze_metadata: false,
};

export const initialImageNftConfig: ImageNftConfig = {
	...initialNftConfig,
	_type: NftType.IMAGE,
	population: [
		{
			file: '',
			output_resolution: '',
		},
	],
};

export const initialMusicNftConfig: MusicNftConfig = {
	...initialNftConfig,
	_type: NftType.MUSIC,
	population: [],
	ipfs: undefined,
};

export const initialVideoNftConfig: VideoNftConfig = {
	...initialNftConfig,
	_type: NftType.VIDEO,
	population: [
		{
			file: '',
			playback: {
				type: PlaybackType.ONCE,
				value: '',
			},
			cover: '',
			output_resolution: '',
		},
	],
};

export const initialP5NftConfig: P5NftConfig = {
	...initialNftConfig,
	_type: NftType.P5JS,
	population: [
		{
			script: '',
			previewImage: '',
			capture: {
				type: CaptureType.RESTART,
				delay: '',
				repeat: '',
			},
			output_format: {
				type: 'Image',
				format: '',
			},
			playback: {
				type: PlaybackType.ONCE,
				value: '',
			},
			output_resolution: '',
		},
	],
};

export const initialPfpProperty: PfpProperty = {
	name: '',
	fileName: '',
	file: {
		preview: '',
		pinInfo: undefined,
	},
	constraint: {
		type: PfpConstraintType.NONE,
		value: 0,
	},
};
export const initialPfpAttribute: PfpAttribute = {
	_status: NftStatus.UNFINISHED,
	name: '',
	properties: [],
};
export const initialPfpPopulation: PfpPopulation = {
	_status: NftStatus.UNFINISHED,
	name: '',
	amount: '1',
	defaultColor: [''],
	attributes: [],
	ipfs: [],
};
export const initialPfpNftConfig: PfpNftConfig = {
	...initialNftConfig,
	population: [],
	_type: NftType.PFP,
};

// Type guards for each type, which will let typescript know that the interface is of the expected type
export function isImageNft(config: NftConfig): config is ImageNftConfig {
	return config._type === NftType.IMAGE;
}

export function isMusicNft(config: NftConfig): config is MusicNftConfig {
	return config._type === NftType.MUSIC;
}

export function isVideoNft(config: NftConfig): config is VideoNftConfig {
	return config._type === NftType.VIDEO;
}

export function isP5Nft(config: NftConfig): config is P5NftConfig {
	return config._type === NftType.P5JS;
}

export function isPfpNft(config: NftConfig): config is PfpNftConfig {
	return config._type === NftType.PFP;
}
