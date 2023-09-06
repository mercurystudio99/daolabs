import * as yup from 'yup';
import { nftValidationSchema } from './nft-validation';
import type { ImageNftConfig } from '../nft-config';

export const imageValidationSchema: yup.SchemaOf<ImageNftConfig> = nftValidationSchema.shape({
	file: yup.string().required('Image is required'),
	outputResolution: yup.string().notRequired(),
});
