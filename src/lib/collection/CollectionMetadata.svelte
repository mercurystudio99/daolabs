<script lang="ts">
	import { formatDistance } from 'date-fns';
	import { onMount } from 'svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Button from '$lib/components/Button.svelte';
	import PreviewImageMetadata from '$lib/components/PreviewImageMetadata.svelte';
	import PreviewMusicMetadata from '$lib/components/PreviewMusicMetadata.svelte';
	import PreviewPfpMetadata from '$lib/components/PreviewPFPMetadata.svelte';
	import PreviewP5jsMetadata from '$lib/components/PreviewP5jsMetadata.svelte';
	import PreviewVideoMetadata from '$lib/components/PreviewVideoMetadata.svelte';

	import { bind, openModal } from '$lib/components/Modal.svelte';
	import { createCustomNotification, errorHandle } from '$utils/notification';
	import {
		NftType,
		isMusicNft,
		type NftConfig,
		type PfpNftConfig,
		isNeedsAdditionalPinningNft,
		type NeedsAdditionPinningNft,
	} from '$models/minter/nft-config';
	import { isMusicCollection, isPfpCollection } from '$utils/collectionHelpers';
	import { createTask, deleteTask } from '$services/tasks/createTasks';
	import { connectedAccount } from '$stores/web3';
	import { pushMusicAnimationMetadataToIpfs } from '$utils/music';
	import { deleteNotification, notificationStore, updateNotification } from '$utils/firestore';
	import { PinningState } from '$constants/ipfs';
	import type { AdvancedCollection as AdvancedCollectionType } from '$models/minter/collection-config';
	import type Store from '$utils/Store';

	export let collection: AdvancedCollectionType;
	export let nfts: Store<NftConfig[]>;
	export let saveCollection: (form: AdvancedCollectionType) => Promise<void>;
	export let updateCollection: () => Promise<void>;
	export let readonly: boolean = false;

	let nftsValue: NftConfig[] = [];
	let notification = notificationStore(collection.id);
	let processing: boolean = false;
	let progress: string = '0';
	let lastPushed: Date;

	onMount(() => {
		const unSubscribeNfts = nfts.subscribe((value) => {
			nftsValue = value;
		});

		const unsubscribeNotification = notification.subscribe((newState) => {
			if (!newState) {
				progress = '0';
				processing = false;
				return;
			}

			if (newState.state === PinningState.DONE) {
				lastPushed = new Date();
				updateCollection()
					.then(() => deleteNotification(collection.id))
					.catch((err) => console.log(err));
			}

			processing =
				newState.state === PinningState.PENDING || newState.state === PinningState.PINNING;

			if (newState.progress !== Number(progress)) {
				progress = newState.progress ? Number(newState.progress * 100).toFixed(0) : '0';
			}
		});

		return () => {
			unSubscribeNfts();
			unsubscribeNotification();
		};
	});

	async function pushAssetsToIpfs() {
		const { update } = createCustomNotification({
			message: 'Pushing assets to IPFS, we will notify you when it is done.',
			type: 'pending',
			autoDismiss: 3000,
		});
		try {
			if (isPfpCollection(collection)) {
				const response = await createTask({
					collectionId: collection.firebaseId,
					userId: $connectedAccount,
				});
				update({
					type: 'success',
					message: response.message,
					autoDismiss: 3000,
				});
				await updateNotification(collection.id, PinningState.PENDING);
			}
			if (isMusicCollection(collection)) {
				const updatedCollection: AdvancedCollectionType = await pushMusicAnimationMetadataToIpfs(
					collection,
				);
				await saveCollection(updatedCollection);
				update({
					message: 'Assets pushed to IPFS',
					type: 'success',
					autoDismiss: 3000,
				});
			}
		} catch (error) {
			errorHandle(String(error.message), update);
			await deleteNotification(collection.id);
		}
	}

	async function cancelPushAssetsToIpfs() {
		await deleteTask({ userId: $connectedAccount, collectionId: collection.firebaseId });
	}

	function hasPreviewableAssets(pfpNfts: PfpNftConfig[]) {
		return pfpNfts.some((p) => p.ipfs);
	}

	function lastPushedDate() {
		if (isNeedsAdditionalPinningNft(nftsValue[0])) {
			const nft = (nftsValue as NeedsAdditionPinningNft[]).find((nftItem) => nftItem.ipfs);
			if (!nft) return;
			return new Date(Number(nft.ipfs.Timestamp));
		}
	}

	function hasPreviewableMetadata(nftsItems: NftConfig[]) {
		return (
			// Either the first nft is a pfp and has previewable assets
			isPfpCollection(collection)
				? hasPreviewableAssets(nftsItems as PfpNftConfig[])
				: // Or the first is not pfp and has an nft
				  nftsItems?.length
		);
	}

	function shouldUpdate() {
		if (nftsValue[0]._type === NftType.PFP) {
			// if there exists some property of an attribute of a population
			// that has a timestamp after the last time the nft was pushed to ipfs
			// then we should update
			// The first population is heuristic enough, as we push all at the same time
			const pfpNft = nftsValue[0] as PfpNftConfig;
			const ipfs = pfpNft?.ipfs?.[0];
			if (ipfs) {
				// Fail gracefully if there is no ipfs data
				try {
					// Check if any of the attribute's properties have a timestamp after the last time the nft was pushed to ipfs
					return pfpNft.layers.some((attribute) => {
						return attribute.properties.some((property) => {
							return property.file.pinInfo.Timestamp > ipfs.Timestamp;
						});
					});
				} catch (e) {
					console.error(e);
					return false;
				}
			}
		} else if (nftsValue[0]._type === NftType.MUSIC) {
			// TODO heuristic
		}
		return false;
	}

	function previewNftMetadata() {
		let component: any;
		const dummyNft = collection.nfts?.[0];
		if (!dummyNft) return;

		switch (dummyNft._type) {
			case NftType.PFP:
				component = PreviewPfpMetadata;
				break;
			case NftType.MUSIC:
				component = PreviewMusicMetadata;
				break;
			case NftType.VIDEO:
				component = PreviewVideoMetadata;
				break;
			case NftType.P5JS:
				component = PreviewP5jsMetadata;
				break;
			default:
				component = PreviewImageMetadata;
				break;
		}

		openModal(
			bind(component, {
				collection,
			}),
		);
	}

	$: lastPushed = nftsValue.length && lastPushedDate();
</script>

<div class="box">
	<h4>Metadata</h4>
	{#if nftsValue.length}
		{#if !readonly}
			{#if isPfpCollection(collection)}
				<InfoSpaceBetween>
					<div slot="left">
						<p>Assets</p>
					</div>
					<div slot="right">
						{#if lastPushed && !processing}
							<p class="metadataUpdated">
								<span class="secondary">pushed</span>
								{formatDistance(lastPushed, new Date(), { addSuffix: true })}
							</p>
						{:else if processing}
							<p class="metadataUpdated">
								<span class="secondary">layering</span>
								{progress}% done
							</p>
						{/if}
					</div>
				</InfoSpaceBetween>
				{#if shouldUpdate()}
					You have updated your assets since the last time you pushed them to IPFS. You should push
					them again.
				{/if}
				<Button
					size="md"
					loading={processing}
					disabled={processing}
					type={'tertiary'}
					on:click={pushAssetsToIpfs}
				>
					Push{processing ? 'ing' : ''} assets to IPFS
				</Button>
				{#if processing}
					<Button size="md" type="tertiary" on:click={cancelPushAssetsToIpfs}>Cancel</Button>
				{/if}
			{/if}
			{#if isMusicNft(nftsValue[0])}
				<InfoSpaceBetween>
					<div slot="left">
						<p>Animation URL</p>
					</div>
					<div slot="right">
						{#if lastPushed}
							<p class="metadataUpdated">
								<span class="secondary">pushed</span>
								{formatDistance(lastPushed, new Date(), { addSuffix: true })}
							</p>
						{/if}
					</div>
				</InfoSpaceBetween>
				<Button size="md" type={'tertiary'} on:click={pushAssetsToIpfs}>Push tracks to IPFS</Button>
			{/if}
		{/if}
		{#if hasPreviewableMetadata(nftsValue)}
			<InfoSpaceBetween>
				<div slot="left">
					<p>URI</p>
				</div>
			</InfoSpaceBetween>
			<Button size="md" type={'tertiary'} on:click={previewNftMetadata}>Preview metadata</Button>
		{/if}
	{:else}
		<p>Once you have created an NFT you can prepare and preview the metadata before deployment.</p>
	{/if}
</div>

<style>
	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	h4 {
		font-size: 16px;
		font-weight: 400;
		color: var(--text-header);
		margin-bottom: 0;
	}

	p {
		font-weight: 400;
		color: var(--text-secondary);
		margin-bottom: 0;
	}

	.metadataUpdated {
		text-align: right;
	}

	.secondary {
		color: var(--text-secondary);
		margin-bottom: 8px;
	}
</style>
