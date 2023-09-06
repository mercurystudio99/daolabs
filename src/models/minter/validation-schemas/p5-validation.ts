import * as yup from 'yup';
import { nftValidationSchema, outputResolutionValidation } from './nft-validation';
import { ipfsPinValidation } from './ipfs-pin-validation';
import type { P5NftConfig } from '../nft-config';

export const p5ValidationSchema: yup.SchemaOf<P5NftConfig> = nftValidationSchema.shape({
	file: yup.string(),
	script: yup.string(),
	capture: yup.object({
		type: yup.mixed().oneOf(['Restart', 'Delay']).notRequired(),
		delay: yup.string().notRequired(),
		repeat: yup.string().notRequired(),
	}),
	outputFormat: yup.object({
		type: yup.mixed().oneOf(['Script', 'Image', 'Video']).notRequired(),
		format: yup.string().notRequired(),
	}),
	playback: yup.object({
		type: yup.mixed().oneOf(['Once', 'Times', 'Repeat']).notRequired(),
		value: yup.string().notRequired(),
	}),
	outputResolution: outputResolutionValidation,
	previewImage: yup.string(),
	ipfs: ipfsPinValidation,
	seed: yup.string(),
});
