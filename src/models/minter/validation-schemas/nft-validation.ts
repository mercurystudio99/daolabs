import * as yup from 'yup';
import { ipfsPinValidation } from './ipfs-pin-validation';
import type { NftConfig } from '../nft-config';

export const outputResolutionValidation = yup
	.string()
	.nullable()
	.matches(/^(?!$)(?:(\d+))?x(?:(\d+))?$/, {
		message: 'Must be in the format 1920x1080, 1920x, or x1080',
		excludeEmptyString: true,
	})
	.notRequired();

export const nftValidationSchema: yup.SchemaOf<NftConfig> = yup.object({
	_id: yup.string().notRequired(),
	_type: yup.mixed().notRequired(),
	_status: yup.mixed().notRequired(),
	_token: yup.string(),
	name: yup.string(),
	symbol: yup.string().max(6, 'Must 6 characters max'),
	description: yup.string().notRequired(),
	externalLink: yup.string().notRequired(),
	totalSupply: yup.number().required('Required field'),
	blockchain: yup.mixed().oneOf(['ethereum', 'tezos']).notRequired(),
	defaultColor: yup.string().notRequired(),
	attributes: yup
		.object({
			properties: yup.array(
				yup.object({
					name: yup.string().required('Must not be empty'),
					value: yup.string().required('Must not be empty'),
				}),
			),
			levels: yup.array(
				yup.object({
					name: yup.string().required('Must not be empty'),
					value: yup.string().required('Must not be empty'),
					max: yup.string().required('Must not be empty'),
				}),
			),
			stats: yup.array(
				yup.object({
					name: yup.string().required('Must not be empty'),
					value: yup.string().required('Must not be empty'),
					max: yup.string().required('Must not be empty'),
				}),
			),
			boosts: yup.array(
				yup.object({
					name: yup.string().required('Must not be empty'),
					value: yup.string().required('Must not be empty'),
					type: yup
						.mixed()
						.oneOf(['boost_number', 'boost_percentage'])
						.required('Must not be empty'),
				}),
			),
		})
		.notRequired(),
	unlockableContent: yup.boolean().notRequired(),
	sensitiveContent: yup.boolean().notRequired(),
	freezeMetadata: yup.boolean().notRequired(),
	ipfsMetadata: ipfsPinValidation,
});
