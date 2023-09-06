<script lang="ts">
	import { ipfsCidUrl } from '$utils/ipfs';
	import Icon from '$lib/components/Icon';
	import { goto } from '$app/navigation';
	import Button from '../Button.svelte';
	import TokenCard from '../TokenCard.svelte';
	import Trans from '../Trans.svelte';

	const list = ['DAOs', 'Crowdfunding', 'NFT projects', 'Indie creators and builders'];

	let currentToken = 0;
	let reRouteLoading = false;

	// TODO: mocks, get real data
	const tokens = [
		{
			tokenUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			owner: 'MeowsDAO',
			ownersAvatar: ipfsCidUrl('QmNk61dYH1MZB6SjAvkU6o56fHdtYif3muSxce2s7JPXKP'),
			name: 'Whisker’s Progeny No.3917',
		},
		{
			tokenUri: ipfsCidUrl('QmZCjbL9tbu9RpvKN2DiNrc8Lvqaat4Hw7DvBJQTR3Jqb7'),
			owner: 'MeowsDAO',
			ownersAvatar: ipfsCidUrl('QmNk61dYH1MZB6SjAvkU6o56fHdtYif3muSxce2s7JPXKP'),
			name: 'Whisker’s Progeny No.3918',
		},
		{
			tokenUri: ipfsCidUrl('QmNk61dYH1MZB6SjAvkU6o56fHdtYif3muSxce2s7JPXKP'),
			owner: 'MeowsDAO',
			ownersAvatar: ipfsCidUrl('QmNk61dYH1MZB6SjAvkU6o56fHdtYif3muSxce2s7JPXKP'),
			name: 'Whisker’s Progeny No.3919',
		},
	];

	function switchTokenDisplayed(value: number) {
		currentToken = (currentToken + value + tokens.length) % tokens.length;
	}

	function goToUserPage() {
		reRouteLoading = true;
		goto('/user').catch((e) => console.log(e));
	}
</script>

<section>
	<article>
		<h1>
			<Trans>Juicebox</Trans>
		</h1>
		<h1>
			<Trans>NFT Marketplace</Trans>
		</h1>
		<div class="description-wrapper">
			<p>
				<Trans>
					The Decentralized Funding Platform. Light enough for a group of friends, powerful enough
					for a global network of anons.
				</Trans>
				<a class="jbLink" href="https://move.xyz/projects/1">Community-owned</a>,<Trans
					>on Ethereum.</Trans
				>
			</p>
			<p class="sub-header">By creators for creators</p>
			{#each list as item}
				<div class="item">
					<img src="/images/bolt.png" alt="⚡️" />
					<p>
						<Trans>
							{item}
						</Trans>
					</p>
				</div>
			{/each}
		</div>
		<div class="button-wrapper">
			<Button size="lg" on:click={goToUserPage} loading={reRouteLoading}>
				<Trans>Create Collection</Trans>
			</Button>
			<!-- NOTE: Commented out as we don't yet have a list nft's page. -->
			<!-- <Button type="secondary" size="lg" on:click={() => goto('/nfts')}>
				<Trans>List NFT</Trans>
			</Button> -->
		</div>
	</article>
	<div class="token-scroller">
		<div class="scroll-button" on:click={() => switchTokenDisplayed(-1)} on:keydown>
			<Icon name="chevronLeft" />
		</div>
		<div class="token-container">
			<TokenCard token={tokens[currentToken]} />
		</div>
		<div class="scroll-button" on:click={() => switchTokenDisplayed(1)} on:keydown>
			<Icon name="chevronRight" />
		</div>
	</div>
</section>

<style lang="scss">
	h1 {
		color: var(--text-header);
		font-size: 3rem;
		line-height: 1.2;
		font-weight: 800;
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin-top: 0px;
		margin-bottom: 0px;
	}
	section {
		position: relative;
		max-width: 1080px;
		margin: 40px auto;
		margin-top: 68px;
		padding: 0px 40px;
		display: flex;
		align-items: center;
		flex-flow: row wrap;
		justify-content: center;
		article {
			flex: 0 0 50%;
			max-width: 50%;
			display: flex;
			flex-direction: column;
			gap: 21px;
			p {
				font-size: 1rem;
				font-weight: 400;
				line-height: 1.57;
			}
			.sub-header {
				color: var(--text-header);
				font-size: 14px;
				margin-bottom: 8px;
			}
			.item {
				display: flex;
				align-items: center;
				margin-bottom: 10px;
				padding-left: 14px;

				&:last-child {
					margin-bottom: 0;
				}
				img {
					height: 24px;
					margin-right: 11px;
				}

				p {
					font-style: italic;
					font-weight: 500;
					font-size: 14px;
					margin: 0;
					letter-spacing: 0.07em;
				}
			}
			.button-wrapper {
				display: flex;
				gap: 40px;
				margin-top: 40px;
			}
		}
		.token-scroller {
			display: flex;
			align-items: center;
			gap: 21px;
			flex: 0 0 45%;
			max-width: 45%;
			margin-left: 21px;

			.scroll-button {
				display: flex;
				background: var(--background-l1);
				color: var(--text-over-action-primary);
				border-radius: 50%;
				font-size: 16px;
				cursor: pointer;
			}

			.token-container {
				font-size: 16px;
				width: 100%;
				height: 100%;
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 850px) {
		section {
			margin-top: 68px;

			h1 {
				font-size: 3rem;
			}
			.token-scroller,
			article {
				flex: 0 0 100%;
				max-width: 100%;
			}
			.token-scroller {
				margin-top: 16px;
			}
			.button-wrapper {
				flex-direction: column;
				gap: 16px !important;
			}
			.token-container {
				font-size: 14px;
			}
		}
	}
</style>
