import * as yup from 'yup';
import { nftValidationSchema } from './nft-validation';
import { ipfsPinValidation } from './ipfs-pin-validation';
import type { MusicNftConfig, MusicAlbum, TrackInfo } from '../nft-config';

export const trackValidationSchema: yup.SchemaOf<TrackInfo> = yup.object({
	_id: yup.mixed(),
	_status: yup.mixed(),
	name: yup.string().required('Must not be empty'),
	artist: yup.string(),
	file: yup.string().required('Required'),
	isSunvox: yup.boolean(),
	playback: yup.object({
		type: yup.mixed().oneOf(['Once', 'Times', 'Repeat']),
		value: yup.string().matches(/^[0-9]*$/, 'Must be a number'),
	}),
});

export const musicAlbumValidationSchema: yup.SchemaOf<MusicAlbum> = yup.object({
	_id: yup.mixed(),
	_status: yup.mixed(),
	name: yup.string().required('Must not be empty'),
	tracks: yup.array(trackValidationSchema).min(1, 'Must have at least 1').required('Required'),
	cover: yup.string(),
	file: yup.mixed(),
});

export const musicValidationSchema: yup.SchemaOf<MusicNftConfig> = nftValidationSchema.shape({
	albums: yup.array(musicAlbumValidationSchema).min(1, 'Must have at least 1').required('Required'),
	ipfs: ipfsPinValidation,
});
