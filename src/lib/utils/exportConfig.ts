import { isMusicNft, isImageNft, isP5Nft, isVideoNft } from '$models/minter/nft-config';
import { ipfsUrlToCid, replaceIpfsDomain } from '$utils/ipfs';
import { deepCopy } from '$utils/object';
import { isAdvancedCollection, isSimpleCollection } from '$utils/collectionHelpers';
import type { Collection } from '$models/minter/collection-config';

export const downloadFileFromString = (data: string, type: string, name: string) => {
	const blob = new Blob([data], { type });
	const url = URL.createObjectURL(blob);
	const downloadLink = document.createElement('a');
	downloadLink.href = url;
	downloadLink.download = name;
	downloadLink.click();
	URL.revokeObjectURL(url);
};

export const exportCollectionConfig = (config: Collection) => {
	const exportable = deepCopy(config);

	exportable.banner = exportable.banner ? ipfsUrlToCid(exportable.banner) : '';
	exportable.logo = exportable.logo ? ipfsUrlToCid(exportable.logo) : '';
	exportable.defaultImage = exportable.defaultImage ? ipfsUrlToCid(exportable.defaultImage) : '';

	if (isSimpleCollection(exportable)) {
		exportable.file = exportable.file ? ipfsUrlToCid(exportable.file) : '';
		downloadFileFromString(
			JSON.stringify(exportable),
			'application/json',
			`${exportable.name}.json`,
		);
		return;
	} else if (isAdvancedCollection(exportable)) {
		if (exportable.reveal) {
			exportable.reveal.preRevealImage = exportable.reveal.preRevealImage
				? ipfsUrlToCid(exportable.reveal.preRevealImage)
				: '';
		}

		if (exportable.nfts) {
			// TODO: we're handling PFP somewhere, maybe don't due to spaghetti code
			exportable.nfts.forEach((nft) => {
				nft._id = undefined;
				nft._status = undefined;
				nft._token = undefined;

				if (isMusicNft(nft)) {
					nft.albums = nft.albums.map((album) => {
						album.cover = album.cover ? replaceIpfsDomain(album.cover) : '';
						album.tracks = album.tracks.map((track) => {
							track.file = replaceIpfsDomain(track.file);
							return track;
						});
						return album;
					});
				} else if (isImageNft(nft)) {
					nft.file = replaceIpfsDomain(nft.file);
				} else if (isP5Nft(nft)) {
					nft.script = replaceIpfsDomain(nft.script);
				} else if (isVideoNft(nft)) {
					if (nft.cover) {
						nft.cover = replaceIpfsDomain(nft.cover);
					}
					nft.file = replaceIpfsDomain(nft.file);
				}
			});
		}
	}
	downloadFileFromString(JSON.stringify(exportable), 'application/json', `${exportable.name}.json`);
};
