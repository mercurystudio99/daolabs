<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { formatDistance } from 'date-fns';
	import { pinFileToIpfs, ipfsCidUrl } from '$utils/ipfs';
	import { getOpenseaMetadataJson } from '$utils/collectionMetadata';
	import { createCustomNotification } from '$utils/notification';
	import Button from '../Button.svelte';
	import InfoSpaceBetween from '../InfoSpaceBetween.svelte';
	import Popover from '../Popover.svelte';
	import Icon from '../Icon';
	import ClipboardTooltip from '../ClipboardTooltip.svelte';
	import PreviewJsonModal from '../PreviewJsonModal.svelte';
	import { bind, openModal } from '../Modal.svelte';
	import CollectionSection from './CollectionSection.svelte';
	import type { PinataPinResponse } from 'pinata_ipfs_sdk';
	import type { Collection } from '$models/minter/collection-config';

	export let title: string;
	export let ipfsMetadata: PinataPinResponse;
	export let readonly: boolean = false;
	export let collection: Collection;

	const dispatch = createEventDispatcher();

	async function pinOpenseaMetadataJson() {
		// TODO: add link on SimpleCollection too, ie Collection
		const json = getOpenseaMetadataJson(collection);
		return pinFileToIpfs(new File([json], 'metadata.json'));
	}

	async function metadataToIpfs() {
		let response: PinataPinResponse;
		const { update } = createCustomNotification({
			type: 'pending',
			message: 'Uploading metadata to ipfs',
		});
		try {
			response = await pinOpenseaMetadataJson();
			update({
				type: 'success',
				message: 'Metadata uploaded to ipfs',
				autoDismiss: 3000,
			});
			dispatch('pinned', { ipfs: response });
		} catch (error) {
			console.log(error);
			update({
				type: 'error',
				message: 'Error uploading metadata to ipfs',
				autoDismiss: 3000,
			});
		}
	}

	const openJsonPreviewModal = () => {
		// TODO: add link to SimpleCollection
		const json = getOpenseaMetadataJson(collection);
		openModal(bind(PreviewJsonModal, { json }));
	};
</script>

<CollectionSection {title}>
	{#if ipfsMetadata}
		{@const date = new Date(Number(ipfsMetadata.Timestamp) * 1000)}
		<div>
			<InfoSpaceBetween>
				<p slot="left" class="secondary">IPFS address</p>
				<p slot="right">
					<span class="secondary">updated</span>
					{formatDistance(date, new Date(), { addSuffix: true })}
				</p>
			</InfoSpaceBetween>
			<p class="cid">
				{ipfsMetadata.IpfsHash}
				<Popover message="Go to IPFS">
					<a target="_blank" href={ipfsCidUrl(ipfsMetadata.IpfsHash)} rel="noreferrer">
						<Icon name="ipfs" />
					</a>
				</Popover>
				<span>
					<ClipboardTooltip target={ipfsMetadata.IpfsHash} />
				</span>
			</p>
		</div>
	{/if}
	<div class="modal-buttons">
		<Button
			buttonProps={{ type: 'button' }}
			size="md"
			type="tertiary"
			fullWidth
			on:click={openJsonPreviewModal}
		>
			Preview contract-level metadata
		</Button>
		{#if !readonly}
			<Button
				buttonProps={{ type: 'button' }}
				size="md"
				type="tertiary"
				fullWidth
				on:click={metadataToIpfs}
			>
				{collection.ipfsMetadata ? 'Redeploy' : 'Deploy'} contract-level metadata to IPFS
			</Button>
		{/if}
	</div>
</CollectionSection>

<style lang="scss">
	.cid {
		word-wrap: break-word;
		font-size: 0.9em;
		margin-bottom: 16px;

		span {
			color: var(--text-action-primary);
		}
	}

	.secondary {
		color: var(--text-secondary);
		margin-bottom: 8px;
	}

	.modal-buttons {
		display: inherit;
		flex-direction: inherit;
		gap: 16px;
	}
</style>
