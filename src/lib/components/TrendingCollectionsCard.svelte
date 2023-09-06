<script lang="ts">
	import Icon from '$lib/components/Icon';
	import { getCollectionPrice, getNftIconName } from '$utils/collectionHelpers';
	import { objectToStyleString } from '$utils/string';
	import ProjectLogo from './ProjectLogo.svelte';
	import Ethereum from './Ethereum.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import type { Collection } from '$models/minter/collection-config';

	export let collection: Collection & { volume: string };
</script>

<a href="collection/{collection.id}">
	<li>
		<div class="logo">
			<ProjectLogo uri={collection.logo} size={70} />
		</div>
		<section>
			<h1>
				{collection.name}
				<Icon
					name={getNftIconName(collection)}
					style={objectToStyleString({
						fontSize: '12px',
					})}
				/>
			</h1>
			<div class="row">
				<div class="item">
					<span> owned by <EnsOrAddress address={collection.creator} /> </span>
				</div>
				<div class="item">
					<span> | </span>
				</div>
				<div class="item">
					<span> {collection.symbol}</span>
				</div>
			</div>

			<div class="row">
				<div class="item">
					<span> floor price </span>
					<Ethereum />
					{getCollectionPrice(collection)}
				</div>
				<div class="item">
					<span> | </span>
				</div>
				<div class="item">
					<span> volume </span>
					<Ethereum />{collection.volume}
				</div>
			</div>
			<p class="description">{collection.description}</p>
		</section>
	</li>
</a>

<style>
	a {
		color: inherit;
		display: flex;
		margin-bottom: 10px;
		background: var(--background-l2);
	}
	li {
		display: flex;
		align-items: center;
		padding: 8px 20px;
		border: 1px solid var(--stroke-tertiary);
		border-radius: var(--radius-lg);
		height: 100%;
		width: 100%;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		li {
			padding: 12.5px 10px;
		}
	}

	li:hover {
		border-color: var(--stroke-primary);
		cursor: pointer;
	}

	h1 {
		font-size: 16px;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 0.1rem;
	}

	section {
		margin-left: 10px;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	p {
		margin: 0;
	}

	p,
	span {
		font-weight: 300;
	}

	.logo {
		width: 70px;
		height: 70px;
		margin-right: 1rem;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.row .item span {
		color: var(--text-tertiary);
	}

	.description {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		word-break: break-word;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		li {
			flex: 0 0 100%;
			max-width: calc(100vw - 20px);
		}
	}
</style>
