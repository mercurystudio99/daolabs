import * as yup from 'yup';
import { nftValidationSchema } from './nft-validation';
import type { EditionConfig } from '../nft-config';

export const editionValidationSchema: yup.SchemaOf<EditionConfig> = nftValidationSchema.shape({
	file: yup.string().required('Image is required'),
	price: yup.number().required('Price is required'),
});
