import { NftStatus, type PfpNftConfig, type PfpProperty } from '$models/minter/nft-config';
import { ipfsCidUrl } from '$utils/ipfs';

export const prepareAllAttributes = (nft: PfpNftConfig) => {
	const layers = nft.layers.map((attr) => {
		const properties = attr.properties.map((property) => ({
			...property,
			file: {
				...property.file,
				preview: ipfsCidUrl(property.file.pinInfo.IpfsHash),
			},
		}));
		return {
			...attr,
			properties,
		};
	});

	return { ...nft, _nftStatus: NftStatus.SAVED, layers };
};

export interface PfpPropertyLayer extends PfpProperty {
	layer: string;
}

export const createExampleLayering = (nft: PfpNftConfig, useFirst = false) => {
	// Provided an nft, pick one layer at random from each attribute.
	let layers: PfpPropertyLayer[] = [];

	for (let index = 0; index < nft.layers?.length; index++) {
		const attribute = nft.layers?.[index];
		if (attribute?.properties?.length) {
			let propertyIndex = 0;
			if (!useFirst) {
				// Pick a property at random
				propertyIndex = Math.floor(Math.random() * attribute.properties.length);
			}
			const property = { ...attribute.properties[propertyIndex], layer: attribute.name };
			layers = [...layers, property];
		} else {
			// NOTE we do this to account for potential empty attributes, as we want to
			// still keep track of the correct index.
			layers = [...layers, {} as PfpPropertyLayer];
		}
	}
	return layers;
};
