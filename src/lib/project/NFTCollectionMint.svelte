<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { parseEther } from 'ethers/lib/utils';
	import { ethers, type ContractTransaction } from 'ethers';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import { formatWad } from '$utils/formatNumber';
	import Icon from '$lib/components/Icon';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import Button from '$lib/components/Button.svelte';
	import { getCollectionById } from '$utils/users/user';
	import { getCollectionPrice, getNftContractAddress } from '$utils/collectionHelpers';
	import Img from '$lib/components/Img.svelte';
	import { mint as mintToken } from '$utils/web3/extensions/NFTokenWrapper';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';
	import type { Collection } from '$models/minter/collection-config';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');
	let collections: Collection[];
	let loadingCollections: boolean = false;
	let minting: boolean = false;
	let selected: string = '';

	function setSelected(id: string) {
		if (selected === id) {
			selected = '';
			return;
		}
		selected = id;
	}

	async function mint(): Promise<ContractTransaction> {
		if (!selected) {
			console.error('No collection selected');
		}
		minting = true;
		try {
			const collection = collections.find((c) => c.id === selected);
			const contractAddress = getNftContractAddress(collection);
			const value = getCollectionPrice(collection);

			console.log('🦄 minting with args', {
				platform: 'daolabs',
				contractAddress,
				metadata: '0x00',
				opts: {
					value: ethers.utils.parseEther(value.toString()),
				},
			});
			const tx = await mintToken('daolabs', contractAddress, undefined, {
				value: ethers.utils.parseEther(value.toString()),
			});
			console.info('Minting tx', tx);
			return tx;
		} catch (err) {
			console.error(err);
		} finally {
			minting = false;
			selected = '';
		}
	}

	onMount(() => {
		const collectionIds = $project.collections;
		if (collectionIds?.length) {
			const collectionPromises = collectionIds.map((id) => getCollectionById(id));
			loadingCollections = true;
			Promise.all(collectionPromises)
				.then((fetched) => {
					collections = fetched;
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					loadingCollections = false;
				});
		}
	});
</script>

{#if loadingCollections}
	<Skeleton loading height="10rem" width="100%" />
{:else if collections?.length}
	<div class="collections">
		<HeavyBorderBox padding="2rem" margin="10px">
			<h3>Collections</h3>
			<p>This treasury supports the below collections</p>
			<div class="items">
				{#each collections as collection}
					{@const price = getCollectionPrice(collection)}
					{@const imageSrc = collection.logo || collection.defaultImage}
					<div
						class="item"
						on:click={() => setSelected(collection.id)}
						on:keydown
						class:selected={selected === collection.id}
					>
						<div class="image">
							{#if imageSrc}
								<Img src={imageSrc} alt="" placeholder="https://via.placeholder.com/120?text=..." />
							{:else}
								<div class="missingImage" />
							{/if}
						</div>
						<div class="name">
							<span>{collection.name}</span>
							<a
								href={`https://move.xyz/collection/${collection.id}`}
								target="_blank"
								rel="noreferrer"
							>
								<Icon name="link" style="color: var(--text-primary)" />
							</a>
						</div>
						<div class="price">
							<a href={null}
								>{formatWad(parseEther(price?.toString()).toHexString(), {
									precision: 4,
								})} ETH</a
							>
						</div>
					</div>
				{/each}
			</div>
			<div class="buttons">
				<Button disabled={!selected} loading={minting} on:click={mint} size="md">Mint</Button>
			</div>
		</HeavyBorderBox>
	</div>
{/if}

<style lang="scss">
	.buttons {
		display: flex;
		justify-content: flex-end;
		margin-top: 10px;
	}
	.collections {
		padding: 0 1rem;
	}
	.items {
		display: flex;
		overflow-x: auto;
		overflow-y: visible;
		padding: 0.5rem 0;
		gap: 1rem;
		> * {
			flex: 0 0;
			flex-basis: auto;
		}
	}
	.item {
		width: 100%;
		max-width: 130px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		border: 0.4px solid var(--original-accent);
		border-radius: var(--radius-md);
		padding: 4px;
		cursor: pointer;
		&.selected {
			box-shadow: 3px 3px 0px var(--original-accent);
		}
		.missingImage {
			width: 120px;
			height: 120px;
			background: var(--original-accent);
		}
		.name {
			font-size: 0.65rem;
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 0.5rem;
			max-height: 50px;
			// white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.price {
			font-size: 0.8rem;
			display: flex;
			a {
				color: var(--text-primary);
			}
		}
	}
</style>
