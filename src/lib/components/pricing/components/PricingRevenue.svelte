<script lang="ts">
	import PopInfo from '$lib/components/PopInfo.svelte';

	// Export variables
	export let price;
	export let currency;
	export let royaltyValue;
</script>

<div class="revenue-block">
	<h4>
		<PopInfo message="Tooltip text">NFT revenue</PopInfo>
	</h4>
	<p>Reserve a percentage of freshly minted NFTs.</p>
	<div class="revenue">
		<span>
			<PopInfo message="Tooltip text">
				<div class="left">Revenue:</div>
			</PopInfo>
			<div class="right">
				<div>
					{price - royaltyValue}
					{currency} /
				</div>
				1 NFT
			</div>
		</span>
		<span>
			<PopInfo message="Tooltip text">
				<div class="left">Royalty rate:</div>
			</PopInfo>
			<div class="right">
				<div>
					{royaltyValue}
					{currency} /
				</div>
				1 NFT
			</div>
		</span>
	</div>
</div>

<style lang="scss">
	.revenue-block {
		display: flex;
		flex-direction: column;
		color: var(--text-secondary);
		margin-bottom: 16px;

		h4 {
			color: var(--text-header);
			margin-bottom: 8px;
		}

		p {
			margin-bottom: 8px;
			font-weight: 300;
		}
		.revenue {
			padding: 8px;
			border: 0.4px solid var(--stroke-tertiary);
			display: flex;
			flex-direction: column;
			gap: 4px;

			span {
				display: flex;
				width: 100%;
				justify-content: space-between;
				gap: 10px;

				.right {
					display: flex;
					flex-wrap: wrap;
					gap: 4px;
					justify-content: flex-end;
				}
				.left {
					width: auto;
				}
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		.revenue-block {
			.revenue {
				gap: 12px;
				span {
					display: inline-block;
				}
			}
		}
	}
</style>
