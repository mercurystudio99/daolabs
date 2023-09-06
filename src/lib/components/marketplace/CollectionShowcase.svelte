<script lang="ts">
	import { formattedNum } from '$utils/formatNumber';
	import { ipfsCidUrl } from '$utils/ipfs';
	import Img from '$lib/components/Img.svelte';
	import EnsOrAddress from '../EnsOrAddress.svelte';

	import Trans from '../Trans.svelte';

	// TODO: mocks, get real data
	const generativeCollections = [
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'GlowingColorsDAO',
			owner: '0x823b92d6a4b2aed4b15675c7917c9f922ea8adad',
			description:
				'hashed traits from current UniSwap price feeds are used to generate memorizing extra long description test',
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'CheckerBoardColorsDAO',
			owner: '0xcc1bf04c877aa5af914f318c7eee8521b48058d2',
			description: 'one checkerboard, shapes and colors....',
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'CirclesDAO',
			owner: '0x451181ed8b4ca6a090c22f051a9bc13dcb4cf512',
			description: 'singular goal is corner the market on artwork comprised of circles...',
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'SquaresDAO',
			owner: '0x451181ed8b4ca6a090c22f051a9bc13dcb4cf512',
			description:
				'out of the box dao treasury management and unparallelled dedication to the most perfect...',
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'DotDashDAO',
			owner: '0x11270bb15d07a658ee379236c005439e7131a25a',
			description:
				'with morse as our guiding star, we intend to outbid any collector for dots and dashes...',
		},
	];
	const featuredCollections = [
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'Moonbirds',
			floorPrice: 53.07,
			change: '+38.45%',
			balance: 100443,
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'BannyVerse',
			floorPrice: 69.42,
			change: '+273.88%',
			balance: 291119.75,
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'Bored Ape Yacht Club',
			floorPrice: 10,
			change: '-57.60%',
			balance: 11006.55,
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'MeowsDAO Genesis Collection',
			floorPrice: 4.2,
			change: '+29.12%',
			balance: 5095.55,
		},
		{
			logo: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			name: 'Infinite Tiles v2',
			floorPrice: 42.55,
			change: '+29.12%',
			balance: 51095.55,
		},
	];
</script>

<section>
	<article>
		<h2>
			<Trans>Generative Collections</Trans>
		</h2>
		{#each generativeCollections as collection}
			<div class="collection">
				<Img
					src={collection.logo}
					alt={collection.logo}
					placeholder={'https://via.placeholder.com/100?text=...'}
					styles={{ width: '100px', maxHeight: '100px' }}
				/>

				<div class="info">
					<span class="name">{collection.name}</span>
					<span
						>by
						<span class="owner">
							<EnsOrAddress address={collection.owner} />
						</span>
					</span>
					<span class="description">{collection.description}</span>
				</div>
			</div>
		{/each}
	</article>
	<article>
		<h2>
			<Trans>Featured Collections</Trans>
		</h2>
		{#each featuredCollections as collection}
			<div class="collection">
				<Img
					src={collection.logo}
					alt="A collection logo"
					placeholder={'https://via.placeholder.com/100?text=...'}
					styles={{ width: '100px', maxHeight: '100px' }}
				/>

				<div class="info">
					<span class="name">{collection.name}</span>
					<span>
						Floor price:
						<span class="price">
							Ξ{formattedNum(collection.floorPrice)}
						</span>
					</span>
				</div>
				<div class="right">
					<span class="change" class:negative={collection.change.charAt(0) === '-'}>
						{collection.change}
					</span>
					<span class="price">
						Ξ{formattedNum(collection.balance)}
					</span>
				</div>
			</div>
		{/each}
	</article>
</section>

<style lang="scss">
	section {
		max-width: 1168px;
		margin: 60px auto;
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		justify-content: space-around;
		padding: 20px;

		article {
			display: flex;
			flex-direction: column;
			gap: 8px;

			h2 {
				color: var(--text-header);
				margin-bottom: 7px;
			}

			.collection {
				display: flex;
				align-items: center;
				gap: 20px;
				max-width: 510px;
				border: 1px solid var(--stroke-secondary);
				padding: 20px;
				height: 128px;

				.info {
					display: flex;
					flex-direction: column;
					color: var(--text-secondary);

					.name {
						color: var(--text-primary);
						font-size: 16px;
						line-height: 20px;
					}

					.owner {
						color: var(--text-action-primary);
					}

					.description {
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						line-clamp: 2;
						-webkit-box-orient: vertical;
					}

					.price {
						color: var(--text-primary);
					}
				}
				.right {
					display: flex;
					flex-direction: column;
					margin-left: auto;
					align-items: flex-end;

					.change {
						color: var(--text-action-primary);
					}
					.negative {
						color: var(--text-failure);
					}
				}
			}
		}
	}
</style>
