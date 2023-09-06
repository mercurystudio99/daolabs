import type { PinataPinResponse } from 'pinata_ipfs_sdk';
import type { DropzoneOutput } from './dropzone';

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
	EDITION = 'Edition',
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

export enum CapsType {
	SENTENCECASE = 'sentenceCase',
	ALLCAPS = 'allCaps',
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

export interface MusicAlbum {
	_id?: string;
	_status?: NftStatus;
	name: string;
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

export interface Attributes {
	properties: Attribute[];
	levels: NumericAttribute[];
	stats: NumericAttribute[];
	boosts: Boost[];
}

export interface Modification {
	status: boolean;
	removeUnderscore?: boolean;
	capStatus?: CapsType;
}

export interface AttrModification {
	name: Modification;
	value: Modification;
}

export interface BasicNftConfig {
	_id: string;
	_type: NftType;
	_status?: NftStatus;
	name: string;
	description: string;
	externalLink: string;
	totalSupply: number;
	blockchain: BlockchainType;
	defaultColor: string;
	attributes?: Attributes;
}

export interface EditionConfig extends BasicNftConfig {
	file: string;
	price: number;
}

export interface NftConfig extends BasicNftConfig {
	_token: string;
	unlockableContent: boolean;
	sensitiveContent: boolean;
	freezeMetadata: boolean;
	ipfsMetadata?: PinataPinResponse;
}

export interface ImageNftConfig extends NftConfig {
	file: string;
	outputResolution: string;
}

export interface MusicNftConfig extends NftConfig {
	albums: MusicAlbum[];
	ipfs?: PinataPinResponse;
}

export interface VideoNftConfig extends NftConfig {
	file?: string;
	cover?: string;
	playback: {
		type: PlaybackType;
		value: string;
	};
	outputResolution?: string;
}

export interface P5NftConfig extends NftConfig {
	script: string;
	previewImage: string; // TODO: probably remove... or ah we do need one for the nft card preview
	capture: {
		type: CaptureType;
		delay: string;
		repeat: string;
	};
	outputFormat: {
		type: string;
		format: string;
	};
	playback: {
		type: PlaybackType;
		value: string;
	};
	outputResolution: string;
	file?: DropzoneOutput | string; // TODO: what is file, as we have script?
	seed?: string;
	ipfs?: PinataPinResponse;
}

export interface PfpNftConfig extends NftConfig {
	defaultColors: string[];
	layers: PfpAttribute[];
	seed?: string;
	ipfs?: PinataPinResponse;
}

export type NeedsAdditionPinningNft = MusicNftConfig | PfpNftConfig;

export const initialModificationConfig: AttrModification = {
	name: {
		status: false,
	},
	value: {
		status: false,
	},
};

export const initialMusicAlbum: MusicAlbum = {
	_status: NftStatus.UNFINISHED,
	name: '',
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

const initialBasicNftConfig: BasicNftConfig = {
	_id: '',
	_type: undefined,
	_status: NftStatus.UNFINISHED,
	name: '',
	description: '',
	externalLink: '',
	totalSupply: 1,
	blockchain: BlockchainType.ETHEREUM,
	defaultColor: '',
	attributes: {
		properties: [],
		levels: [],
		stats: [],
		boosts: [],
	},
};

export const initialNftConfig: NftConfig = {
	_token: '',
	...initialBasicNftConfig,
	unlockableContent: false,
	sensitiveContent: false,
	freezeMetadata: false,
};

export const initialEditionConfig: EditionConfig = {
	...initialBasicNftConfig,
	_type: NftType.EDITION,
	file: '',
	price: 0,
};

export const initialImageNftConfig: ImageNftConfig = {
	...initialNftConfig,
	_type: NftType.IMAGE,
	file: '',
	outputResolution: '',
};

export const initialMusicNftConfig: MusicNftConfig = {
	...initialNftConfig,
	_type: NftType.MUSIC,
	albums: [],
	ipfs: undefined,
};

export const initialVideoNftConfig: VideoNftConfig = {
	...initialNftConfig,
	_type: NftType.VIDEO,
	file: '',
	playback: {
		type: PlaybackType.ONCE,
		value: '',
	},
	cover: '',
	outputResolution: '',
};

export const initialP5NftConfig: P5NftConfig = {
	...initialNftConfig,
	_type: NftType.P5JS,
	script: '',
	previewImage: '',
	capture: {
		type: CaptureType.RESTART,
		delay: '',
		repeat: '',
	},
	outputFormat: {
		type: 'Script',
		format: '',
	},
	playback: {
		type: PlaybackType.ONCE,
		value: '',
	},
	outputResolution: '',
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

export const initialPfpNftConfig: PfpNftConfig = {
	...initialNftConfig,
	_status: NftStatus.UNFINISHED,
	defaultColors: [],
	layers: [],
	_type: NftType.PFP,
};

// Type guards for each type, which will let typescript know that the interface is of the expected type
export function isImageNft(
	config: BasicNftConfig | EditionConfig | NftConfig,
): config is ImageNftConfig {
	return config?._type === NftType.IMAGE;
}

export function isMusicNft(config: BasicNftConfig | NftConfig): config is MusicNftConfig {
	return config?._type === NftType.MUSIC;
}

export function isVideoNft(config: BasicNftConfig | NftConfig): config is VideoNftConfig {
	return config?._type === NftType.VIDEO;
}

export function isP5Nft(config: BasicNftConfig | NftConfig): config is P5NftConfig {
	return config?._type === NftType.P5JS;
}

export function isPfpNft(config: BasicNftConfig | NftConfig): config is PfpNftConfig {
	return config?._type === NftType.PFP;
}

export function isEditionNft(config: BasicNftConfig | NftConfig): config is EditionConfig {
	return config?._type === NftType.EDITION;
}

export function isAdvancedNft(config: BasicNftConfig | NftConfig): config is NftConfig {
	return 'freezeMetadata' in config;
}

export function isNeedsAdditionalPinningNft(config: NftConfig): config is NeedsAdditionPinningNft {
	return isMusicNft(config) || isPfpNft(config);
}

export function hasIpfsMetadata(obj: any): obj is NftConfig & { ipfsMetadata: any } {
	return !!(obj as NftConfig).ipfsMetadata;
}
