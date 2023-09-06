import { pinFileToIpfs } from '$utils/ipfs';
import { updateNotification } from './firestore';
import type { MusicCollection } from '$models/minter/collection-config';
import type { MusicNftConfig, MusicAlbum } from '$models/minter/nft-config';

function sanitizeTracks(tracks: MusicAlbum['tracks']) {
	return tracks.map((track) => ({
		artist: track.artist,
		name: track.name,
		file: track.file,
	}));
}

export function getMusicTokenIdAssetJson(
	collection: MusicCollection,
	nftIndex: number,
	albumIndex: number,
) {
	const nft = collection.nfts[nftIndex] as unknown as MusicNftConfig;
	const album = nft.albums[albumIndex];

	if (!album) {
		return false;
	}

	return {
		cover: album.cover,
		tracks: sanitizeTracks(album.tracks),
	};
}

export function lastPushedToIpfs(nft: MusicNftConfig) {
	if (!nft.ipfs) {
		return -1;
	}
	return nft.ipfs.Timestamp;
}

export async function pushMusicAnimationMetadataToIpfs(collection: MusicCollection) {
	await updateNotification(collection.id, 'pinning');
	const nfts = collection.nfts;
	for (let i = 0; i < nfts.length; i++) {
		const albums = [];
		for (let j = 0; j < nfts[i].albums.length; j++) {
			const albumJson = getMusicTokenIdAssetJson(collection, i, j);
			if (!albumJson) {
				continue;
			}
			albums.push(albumJson);
		}
		const albumsString = JSON.stringify(albums);
		const pinataResponse = await pinFileToIpfs(new File([albumsString], 'metadata.json'));
		nfts[i].ipfs = pinataResponse;
	}
	await updateNotification(collection.id, 'done');
	return collection;
}
