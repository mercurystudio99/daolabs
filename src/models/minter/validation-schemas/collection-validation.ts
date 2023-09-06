import * as yup from 'yup';
import { parse, isValid, format } from 'date-fns';
import { isRevenueSplit } from '$models/user/revenue-splits';
import {
	type AdvancedCollection,
	type Royalty,
	type Collection,
	RevealType,
} from '../collection-config';
import { limitedRevenueSplitValidation } from './revenue-split-validation';

export const royaltyValidationSchema: yup.SchemaOf<Royalty> = yup.object({
	creator_address: yup.lazy((value) =>
		isRevenueSplit(value)
			? limitedRevenueSplitValidation
			: yup
					.string()
					.matches(/^0x[a-fA-F0-9]{40}$/g, 'Must be a valid address')
					.required(),
	),
	royalty: yup
		.number()
		.transform((value: number) => (isNaN(value) ? undefined : value))
		.max(15, 'Must not be over 15%')
		.required('Required field'),
});

const revealValidation = yup.object({
	revealType: yup.mixed().notRequired(),
	revealValue: yup.string().notRequired(),
	preRevealImage: yup.string().notRequired(),
});

export const requiredRevealValidation = yup.object({
	preRevealImage: yup.string().notRequired(),
	revealType: yup.mixed(),
	revealValue: yup.lazy(() => {
		return yup.string().when('revealType', {
			is: RevealType.DATE,
			then: yup
				.string()
				.matches(/^[0-9]{1,2} [a-zA-Z]{3} [0-9]{4}$/g, 'Must be a valid date')
				.transform((currentValue, originalValue) => {
					const date = parse(originalValue as string, 'dd MMM yyyy', new Date());
					if (isValid(date)) {
						return format(date, 't');
					}
					return currentValue as string;
				}),
			otherwise: yup
				.string()
				.matches(/^[0-9]+$/g, 'Must be a valid block number')
				.when('revealType', {
					is: RevealType.BLOCK,
					then: yup.string().required('Block number is required'),
					otherwise: yup.string().notRequired(),
				}),
		});
	}),
});

export type AdvancedCollectionOmitKeys = 'nfts' | 'pricing';

export type SimpleCollectionOmitKeys = 'file' | 'payoutAddress' | 'price';

type CommonCollectionOmitKeys =
	| 'airdrops'
	| 'contracts'
	| 'ipfsMetadata'
	| 'mintStart'
	| 'mintEnd'
	| 'symbol'
	| 'firebaseId'
	| 'standard';

// NOTE: the collectionValidationSchema is only used for AdvancedCollection
export const collectionValidationSchema: yup.SchemaOf<Omit<Collection, CommonCollectionOmitKeys>> =
	yup.object({
		id: yup.string().notRequired(),
		name: yup.string().required('Required field'),
		category: yup.string(),
		description: yup.string().notRequired(),
		links: yup.array(yup.string()),
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		royalty: royaltyValidationSchema.default(undefined).nullable().notRequired(),
		defaultColors: yup.array(yup.string()).notRequired(),
		logo: yup.string().notRequired(),
		banner: yup.string().notRequired(),
		defaultImage: yup.string().notRequired(),
		randomize: yup.boolean().notRequired(),
		creator: yup.string().notRequired(),
		network: yup.mixed().notRequired(),
		type: yup.mixed().notRequired(),
	});

// NOTE: the collectionValidationSchema is only used for AdvancedCollection
export const advancedCollectionValidationSchema: yup.SchemaOf<
	Omit<AdvancedCollection, AdvancedCollectionOmitKeys | CommonCollectionOmitKeys>
> = yup.object({
	id: yup.string().notRequired(),
	type: yup.mixed().notRequired(),
	nftType: yup.mixed().notRequired(),
	name: yup.string().required('Required field'),
	creator: yup.string().notRequired(),
	category: yup.string(),
	description: yup.string().notRequired(),
	links: yup.array(yup.string()),
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	royalty: royaltyValidationSchema.default(undefined).nullable().notRequired(),
	defaultColors: yup.array(yup.string()).notRequired(),
	logo: yup.string().notRequired(),
	banner: yup.string().notRequired(),
	defaultImage: yup.string().notRequired(),
	randomize: yup.boolean().notRequired(),
	network: yup.mixed().notRequired(),
	reveal: revealValidation.notRequired(),
});
