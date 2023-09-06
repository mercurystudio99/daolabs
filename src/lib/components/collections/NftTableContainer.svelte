<script lang="ts">
	import TableLargeIcon from '../minter/icons/TableLargeIcon.svelte';
	import TableSmallIcon from '../minter/icons/TableSmallIcon.svelte';
	import LeftSidebar from '../minter/icons/LeftSidebar.svelte';
	import NftTableViewIcon from './NftTableViewIcon.svelte';

	export let nftContainer: HTMLElement | null = null;
	export let view: 'small' | 'large' = 'large';
	export let sidebarView: boolean = false;
</script>

<section class="nft-table">
	<div class="top-bar">
		<slot name="headerAddons" />
		<NftTableViewIcon active={view === 'large'} on:click={() => (view = 'large')}>
			<TableLargeIcon active={view === 'large'} />
		</NftTableViewIcon>
		<NftTableViewIcon active={view === 'small'} on:click={() => (view = 'small')}>
			<TableSmallIcon active={view === 'small'} />
		</NftTableViewIcon>
		<NftTableViewIcon active={sidebarView === true} on:click={() => (sidebarView = !sidebarView)}>
			<LeftSidebar active={sidebarView === true} />
		</NftTableViewIcon>
	</div>
	<div class="table-content">
		{#if sidebarView}
			<slot name="sidebar" />
		{/if}
		<div class="nfts-container {view}" bind:this={nftContainer}>
			<slot name="nfts" />
		</div>
		<slot name="footer" />
	</div>
</section>

<style lang="scss">
	.nft-table {
		.top-bar {
			display: flex;
			justify-content: space-between;
			margin: 16px 0;
			align-items: center;
			flex-wrap: wrap;
			.search {
				min-width: 175px;
				flex-grow: 1;
				.icon {
					display: flex;
					align-items: center;
				}
			}
		}
		.table-content {
			display: flex;
			overflow: hidden;

			.nfts-container {
				width: 100%;
				display: grid;
				height: 700px;
				overflow: auto;
				justify-content: center;

				&.large {
					grid-template-columns: repeat(auto-fill, 150px);
					grid-auto-rows: 150px;
					gap: 50px;
				}
				&.small {
					grid-template-columns: repeat(auto-fill, 100px);
					grid-auto-rows: 100px;
					gap: 25px;
				}
			}
		}

		.large {
			height: 750px;
		}
		.small {
			height: 730px;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		.nft-table {
			.table-content {
				.nfts-container {
					flex: 1;
				}
			}
		}
	}
	@media (min-width: 400px) {
		.nft-table {
			.top-bar {
				justify-content: flex-end;
				gap: 16px;
			}
		}
	}
	@media (min-width: 640px) {
		.nft-table {
			.top-bar {
				gap: 30px;
			}
		}
	}
</style>
