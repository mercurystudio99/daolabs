<script lang="ts">
	import { isAddress } from 'ethers/lib/utils';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import Icon from '$lib/components/Icon';
	import Img from '$lib/components/Img.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { getLinkIconProps } from '$utils/links';
	import { toSentenceCase } from '$utils/string';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import { getRoyaltyAddresses } from '$models/minter/collection-config';
	import ExpandArrow from '../advanced-arrow/ExpandArrow.svelte';
	import Boost from '../boost/Boost.svelte';
	import type { AdvancedCollection } from '$models/minter/collection-config';
	import type { TokenStandard } from '$models/minter/token-standard';
	import type { Attribute, NftConfig } from '$models/minter/nft-config';

	export let standard: TokenStandard;
	export let collection: AdvancedCollection;
	export let nft: NftConfig;

	const calculateTotalSupply = (totalSupply: number) => {
		if (!totalSupply && (!collection.nfts || collection.nfts.length === 0)) {
			return 'n/a';
		}

		const collectionSupply = collection.nfts
			? collection.nfts.reduce((supply, nftConfig) => supply + Number(nftConfig.totalSupply), 0)
			: 0;
		return totalSupply ? Number(totalSupply) + collectionSupply : collectionSupply;
	};

	const calculateRarity = (attribute: Attribute): string => {
		if (collection.nfts && collection.nfts.length > 0) {
			const amount = collection.nfts.reduce((acc, value) => {
				const found = value.attributes.properties.some(
					(prop) => prop.name === attribute.name && prop.value === attribute.value,
				);
				if (found) {
					acc += 1;
				}
				return acc;
			}, 0);
			const percentage = (amount / collection.nfts.length) * 100;
			return `${percentage.toFixed(0)}%`;
		}
		return '--%';
	};

	let showCollectionInfo = false;
	let showAttributes = true;
	let showLevels = true;
	let showStats = true;
	let showBoosts = true;
	let showDetails = true;

	$: totalSupply = calculateTotalSupply(nft.totalSupply);
	$: creatorAddresses = getRoyaltyAddresses(collection.royalty);
</script>

<section class="nft-preview">
	<h2>Preview</h2>
	<div class="preview">
		<div class="subsection">
			<h4 class="section-title">Collection</h4>
			{#if showCollectionInfo}
				<div
					class="banner"
					style={`background-image: url(${collection.banner})`}
					class:missing={!collection.banner}
				>
					<div class="icon">
						<Icon name="missingImage" viewBox="0 0 18 16" />
					</div>
					{#if !collection.banner}
						<span>1400 x 400</span>
					{/if}
				</div>
				<div class="logo" class:missing={!collection.logo}>
					<div class="icon">
						<Icon name="missingImage" viewBox="0 0 18 16" />
					</div>
					{#if !collection.logo}
						350 x 350
					{/if}
					<Img
						src={replaceIpfsDomain(collection.logo)}
						alt={collection.logo}
						placeholder="https://via.placeholder.com/350?text=..."
					/>
				</div>
				<div class="collection-info">
					<h1>{collection.name || 'Name'}</h1>
					<div class="links">
						{#if collection.links?.length > 0}
							{#each collection.links as link}
								<a class="link" href={link} target="_blank" rel="noreferrer">
									<Icon {...getLinkIconProps(link)} />
									{getLinkIconProps(link).name === 'twitter' ||
									getLinkIconProps(link).name === 'globe'
										? link
										: ''}
								</a>
							{/each}
						{/if}
					</div>
					<p class="description">{collection.description}</p>
				</div>
			{/if}
			<ExpandArrow bind:expanded={showCollectionInfo} />
		</div>
		<h1 class:placeholder={!nft.name}>{nft.name || 'Name'}</h1>
		<div class="mint-info">
			<h4>
				<PopInfo message="Tooltip text">Mint</PopInfo>
			</h4>
			<span>
				Total Supply: {totalSupply}
			</span>
			<span> Total Earned: 0 </span>
		</div>
		<slot />
		{#if nft.attributes.properties.length > 0}
			<div class="subsection">
				<h4 class="section-title">Attributes</h4>
				{#if showAttributes}
					<div class="attribute-container">
						{#each nft.attributes.properties as attribute}
							<div class="attribute">
								<span class="name">{attribute.name}</span>
								<span class="value">{attribute.value}</span>
								<span class="rarity">{calculateRarity(attribute)} have this trait</span>
							</div>
						{/each}
					</div>
				{/if}
				<ExpandArrow bind:expanded={showAttributes} />
			</div>
		{/if}
		{#if nft.attributes.levels.length > 0}
			<div class="subsection">
				<h4 class="section-title">Rankings</h4>
				{#if showLevels}
					<div class="details-container">
						{#each nft.attributes.levels as level}
							<p class="level-label">
								<span>{level.name}</span>
								<span>{level.value} of {level.max}</span>
							</p>
							<div class="progress-bar">
								<ProgressBar percentage={(Number(level.value) / Number(level.max)) * 100} />
							</div>
						{/each}
					</div>
				{/if}
				<ExpandArrow bind:expanded={showLevels} />
			</div>
		{/if}
		{#if nft.attributes.stats.length > 0}
			<div class="subsection">
				<h4 class="section-title">Stats</h4>
				{#if showStats}
					<div class="details-container">
						{#each nft.attributes.stats as stat}
							<p>
								<span>{stat.name}</span>
								<span>{stat.value} of {stat.max}</span>
							</p>
						{/each}
					</div>
				{/if}
				<ExpandArrow bind:expanded={showStats} />
			</div>
		{/if}
		{#if nft.attributes.boosts.length > 0}
			<div class="subsection">
				<h4 class="section-title">Boosts</h4>
				{#if showBoosts}
					<div class="boosts">
						{#each nft.attributes.boosts as boost}
							<Boost {boost} {collection} />
						{/each}
					</div>
				{/if}
				<ExpandArrow bind:expanded={showBoosts} />
			</div>
		{/if}
		<div class="subsection">
			<h4 class="section-title">Details</h4>
			{#if showDetails}
				<div class="details-container">
					<p>
						<span>Contract Address</span>
						<i>Not yet deployed</i>
					</p>
					<p>
						<span>Token ID</span>
						<i>Not yet set</i>
					</p>
					<p>
						<span>Token Standard</span>
						<span>{standard}</span>
					</p>
					<p>
						<span>Blockchain</span>
						<span>{toSentenceCase(nft.blockchain)}</span>
					</p>
					<p>
						<span>Creator Fees</span>
						<span>{collection.royalty?.royalty ?? '0'}%</span>
					</p>
					<p>
						<span>Creator Address</span>
						<span>
							{#if collection.royalty}
								{#each creatorAddresses as address}
									{#if isAddress(address)}
										<EnsOrAddress {address} />
									{:else}
										<span>{address}</span>
									{/if}
								{/each}
							{:else}
								<i>No royalty address set</i>
							{/if}
						</span>
					</p>
				</div>
			{/if}
			<ExpandArrow bind:expanded={showDetails} />
		</div>
	</div>
</section>

<style lang="scss">
	.nft-preview {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
		border-left: 1px solid var(--stroke-secondary);
		flex-basis: 50%;
		h2 {
			font-size: 21px;
			color: var(--text-header);
			margin-bottom: 16px;
		}

		.placeholder {
			color: var(--text-tertiary);
		}

		.preview {
			position: relative;
			display: flex;
			flex-direction: column;
			height: 100%;
			gap: 16px;

			h1 {
				margin: 0;
				font-size: 32px;
				width: 100%;
				text-align: center;
			}

			.mint-info {
				display: flex;
				flex-direction: column;

				h4 {
					font-size: 21px;
					color: var(--text-header);
					margin: 0;
				}

				span {
					font-weight: 300;
					color: var(--text-secondary);
				}
			}
			.section-title {
				color: var(--text-header);
				margin-bottom: 4px;
				font-weight: 300;
			}

			.subsection {
				display: flex;
				flex-direction: column;

				.banner {
					margin-top: 12px;
					width: 100%;
					height: 160px;
					background-repeat: no-repeat;
					background-size: cover;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					box-shadow: var(--background-l1) 10px 10px;

					.icon {
						display: none;
					}

					span {
						display: none;
						margin-bottom: 40px;
					}
				}

				.missing {
					background: var(--background-l2);
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 12px;
					color: var(--text-tertiary);

					.icon {
						display: flex !important;
						font-size: 38px;
						color: rgba(245, 163, 18, 0.24);
					}
				}

				.logo {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					margin: -75px auto 0;
					width: 150px;
					height: 150px;
					border: 1px solid var(--stroke-primary);

					.icon {
						display: none;
					}
				}
				.collection-info {
					display: flex;
					flex-direction: column;
					align-items: center;
					margin: 16px 0;

					h1 {
						font-size: 36px;
						line-height: 48px;
						margin: 16px 0;
					}

					.links {
						width: 100%;
						gap: 16px;
						display: flex;
						flex-wrap: wrap;
						justify-content: center;
						color: var(--text-action-primary);

						.link {
							display: flex;
							align-items: center;
							gap: 8px;
						}
					}

					.description {
						margin: 16px 0;
						color: var(--text-tertiary);
						text-align: justify;
					}
				}

				.attribute-container {
					display: grid;
					grid-template-columns: repeat(auto-fill, 160px);
					column-gap: 28px;
					row-gap: 16px;
					align-self: center;
					margin-top: 12px;
					width: 100%;
					margin-bottom: 16px;

					.attribute {
						width: 100%;
						background: var(--background-l0);
						border: 1px solid var(--stroke-secondary);
						padding: 10px;
						display: flex;
						flex-direction: column;

						.name {
							font-size: 11px;
							color: #7fcec9;
						}
						.value {
							font-size: 14px;
							line-height: 24px;
						}
						.rarity {
							font-size: 11px;
							line-height: 24px;
							color: var(--text-secondary);
						}
					}
				}

				.boosts {
					display: flex;
					gap: 30px;
					flex-wrap: wrap;
				}

				.details-container {
					display: flex;
					flex-direction: column;
					margin-top: 12px;
					margin-bottom: 16px;
					color: var(--text-tertiary);

					.level-label {
						margin-top: 4px;
						margin-bottom: 4px;
					}

					.progress-bar {
						height: 16px;
						--color: var(--text-action-primary);
					}

					p {
						display: flex;
						justify-content: space-between;
						margin-bottom: 8px;

						span {
							display: inherit;
							flex-direction: column;
						}

						.link {
							color: var(--text-action-primary);
							display: flex;
							gap: 8px;
							align-items: center;
						}

						&:last-child {
							margin-bottom: 0;
						}
					}
				}
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		.nft-preview {
			border-left: none;
			padding: 0;
			border-top: 1px solid var(--stroke-secondary);
			padding-top: 16px;
		}
	}
</style>
