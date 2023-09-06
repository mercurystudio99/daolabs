<script lang="ts">
	import AccountTrophy from './AccountTrophy.svelte';
	import ArrowLeft from './icons/ArrowLeft.svelte';
	import ArrowRight from './icons/ArrowRight.svelte';
	import Information from './icons/Information.svelte';
</script>

<div class="scroll-container">
	<ArrowLeft />
	<div class="item">
		<img src="/images/banny.png" alt="" />
		<div class="footer">
			<AccountTrophy />
			<div class="Information-container"><Information /></div>
		</div>
	</div>
	<ArrowRight />
</div>

<style lang="scss">
	.scroll-container {
		display: flex;
		flex-direction: row;
		align-items: center;

		gap: 21px;

		.item {
			box-sizing: border-box;

			width: 481px;
			height: 481px;

			background: #fbf9f6;
			border: 1px solid rgba(180, 179, 177, 0.6);
			box-shadow: 0px 4px 15px;

			img {
				width: 420px;
				height: 403px;

				margin: 12px 34px 0px 28px;
			}

			.footer {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.Information-container {
					margin-right: 28px;
				}
			}
		}
	}
</style>
