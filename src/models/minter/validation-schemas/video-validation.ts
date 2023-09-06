import * as yup from 'yup';
import { nftValidationSchema, outputResolutionValidation } from './nft-validation';
import type { VideoNftConfig } from '../nft-config';

export const videoValidationSchema: yup.SchemaOf<VideoNftConfig> = nftValidationSchema.shape({
	file: yup.string().required('Required'),
	playback: yup.object({
		type: yup.mixed().oneOf(['Once', 'Times', 'Repeat']).notRequired(),
		value: yup.string().notRequired(),
	}),
	cover: yup.string(),
	outputResolution: outputResolutionValidation,
});
