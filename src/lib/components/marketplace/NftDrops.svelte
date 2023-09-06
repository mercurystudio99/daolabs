<script lang="ts">
	import { ipfsCidUrl } from '$utils/ipfs';
	import Icon from '$lib/components/Icon';
	import { browser } from '$app/environment';
	import Trans from '../Trans.svelte';

	// TODO: mocks, get real data
	let dropDisplayPage = 0;
	let innerWidth = browser ? window.innerWidth : null;
	const drops = [
		{
			imageUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			title: 'Communi3: Mad Scientists',
			icon: '',
			protected: false,
		},
		{
			imageUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			title: 'Doodles: The Dooplicator',
			icon: 'gem',
			protected: false,
		},
		{
			imageUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			title: 'Bannypolooza by BannyVerse',
			icon: 'rocket',
			protected: true,
		},
		{
			imageUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			title: 'Doodles: The Dooplicator',
			icon: 'gem',
			protected: false,
		},
		{
			imageUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			title: 'Communi3: Mad Scientists',
			icon: '',
			protected: false,
		},
		{
			imageUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			title: 'Bannypolooza by BannyVerse',
			icon: 'rocket',
			protected: true,
		},
		{
			imageUri: ipfsCidUrl('QmeJwVLA5ybNgrtCeMTVFs5mWiLMbBhcxTXvsRu4k67i9v'),
			title: 'Bannypolooza by BannyVerse',
			icon: 'rocket',
			protected: true,
		},
	];

	let dropDisplayAmount: number;
	let pages: any[];

	$: dropDisplayAmount = innerWidth >= 1000 ? 3 : innerWidth >= 500 ? 2 : 1;
	$: displayedDrops = [...drops].splice(dropDisplayPage * dropDisplayAmount, dropDisplayAmount);
	$: pages = Array(Math.ceil(drops.length / dropDisplayAmount));

	function changePage(value: number) {
		dropDisplayPage = (dropDisplayPage + value + pages.length) % pages.length;
	}
</script>

<svelte:window bind:innerWidth />

<section>
	<article>
		<h2>
			<Trans>Juicebox NFT Drops</Trans>
		</h2>
		<div class="gallery">
			<div class="wrapper">
				<div class="scroll-button" on:click={() => changePage(-1)} on:keydown>
					<Icon name="chevronLeft" />
				</div>
				<div class="drops-wrapper">
					{#each displayedDrops as drop}
						<div class="drop">
							<img src={drop.imageUri} alt="" />
							<span class="title">
								{drop.title}
								{#if drop.protected}
									<Icon name="shield" viewBox="0 0 16 18" />
								{/if}
							</span>
							<span class={`addon ${String(drop.icon)}`}>
								{#if drop.icon === 'gem'}
									<Icon name="gem" viewBox="0 0 34 30" />
								{:else if drop.icon === 'rocket'}
									<Icon name="rocket" viewBox="0 0 30 36" />
								{/if}
							</span>
						</div>
					{/each}
				</div>
				<div class="scroll-button" on:click={() => changePage(1)} on:keydown>
					<Icon name="chevronRight" />
				</div>
			</div>
			<div class="pagination">
				{#each pages as page, index}
					<div id={page} class="page" class:current={index === dropDisplayPage} />
				{/each}
			</div>
		</div>
	</article>
</section>

<style lang="scss">
	section {
		margin-top: 60px;
		padding: 18px 20px;
		background: var(--background-l2);

		article {
			margin: auto;
			max-width: 1168px;
			text-align: center;

			h2 {
				color: var(--text-header);
				font-weight: 500;
				font-size: 21px;
				margin-bottom: 32px;
			}

			.gallery {
				width: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;

				.wrapper {
					display: flex;
					gap: 28px;
					align-items: center;

					.scroll-button {
						display: flex;
						background: var(--background-l1);
						color: var(--text-over-action-primary);
						border-radius: 50%;
						font-size: 16px;
						cursor: pointer;
					}
					.drops-wrapper {
						display: flex;
						gap: 14px;
						overflow: visible;

						.drop {
							position: relative;
							box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.25);
							flex-basis: 33%;

							img {
								width: 100%;
								height: 100%;
							}
							.title {
								position: absolute;
								font-size: 16px;
								font-weight: 500;
								bottom: 6px;
								left: 16px;
								display: flex;
								align-items: center;
								gap: 8px;
							}
							.addon {
								position: absolute;
								top: 18px;
								right: 18px;
								font-size: 34px;
							}
							.gem {
								color: #e9a73e;
							}
						}
					}
				}

				.pagination {
					height: 8px;
					display: flex;
					gap: 2px;
					margin-top: 40px;

					.page {
						width: 8px;
						height: 100%;
						background: var(--background-l1);
						opacity: 0.6;
						border-radius: 50%;
					}
					.current {
						opacity: 1;
						width: 40px;
						border-radius: 30px;
					}
				}
			}
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 1000px) {
		section {
			article {
				.gallery {
					.wrapper {
						.drops-wrapper {
							.drop {
								flex-basis: 50%;
							}
						}
					}
				}
			}
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		section {
			article {
				.gallery {
					.wrapper {
						.drops-wrapper {
							.drop {
								flex-basis: 100%;
							}
						}
					}
				}
			}
		}
	}
</style>
