import * as yup from 'yup';
import { nftValidationSchema } from './nft-validation';
import { ipfsPinValidationRequired, ipfsPinValidation } from './ipfs-pin-validation';
import type { PfpAttribute, PfpNftConfig, PfpProperty } from '../nft-config';

export const pfpPropertiesValidationSchema: yup.SchemaOf<PfpProperty> = yup.object({
	_id: yup.mixed(),
	name: yup.string().required('Must not be empty'),
	fileName: yup.string(),
	file: yup.object({
		preview: yup.string(),
		pinInfo: ipfsPinValidationRequired,
	}),
	constraint: yup.object({
		type: yup.mixed().oneOf([0, 1, 2]),
		value: yup.number(),
	}),
});

export const pfpAttributeValidationSchema: yup.SchemaOf<PfpAttribute> = yup.object({
	_id: yup.mixed(),
	_status: yup.mixed(),
	name: yup.string().required('Must not be empty'),
	properties: yup
		.array(pfpPropertiesValidationSchema)
		.min(1, 'Must have at least 1')
		.required('Required'),
});

export const pfpValidationSchema: yup.SchemaOf<PfpNftConfig> = nftValidationSchema.shape({
	defaultColors: yup.array(yup.string()).notRequired(),
	layers: yup
		.array(pfpAttributeValidationSchema)
		.min(1, 'Must have at least 1 layer')
		.required('Required'),
	ipfs: ipfsPinValidation,
	seed: yup.string().notRequired(),
	ipfsMetadata: ipfsPinValidation,
});
