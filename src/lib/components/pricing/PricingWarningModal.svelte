<script lang="ts">
	import DescriptiveNumberedButton from '$lib/create/DescriptiveNumberedButton.svelte';
	import PricingModal from '$lib/components/pricing/PricingModal.svelte';
	import { bind, openModal } from '../Modal.svelte';

	export let close;
	export let collection;
	export let saveCollection;

	const openPricingModal = (method: string) => () => {
		openModal(bind(PricingModal, { collection, saveCollection, method, close }), {
			fullscreen: true,
		});
	};

	const buttons = [
		{
			title: 'Fixed price',
			description: 'Set NFT price and a duration for the sale.',
			onClick: openPricingModal('fixed'),
			disabled: false,
		},
		{
			title: 'Timed auction',
			description: 'Sell your NFT using our auction tool.',
			onClick: openPricingModal('highest'),
			// disabled for release under #459
			disabled: true,
		},
	];
</script>

<main>
	<h3>Pricing</h3>
	<p>
		Congrats, you’ve just created NFT Collection and added NFTs to it. Now define price and revenue
		addresses for your NFTs.
	</p>
	<p>
		Choose the Type of sale and the Price. In a Fixed price sale, the seller establishes the NFT
		price. To learn more about Timed auction sales, you can refer to our tutorials and documentation
		which are available <a href="../pricing-documentation" target="_blank"> here</a>.
	</p>

	{#each buttons as button, number}
		<DescriptiveNumberedButton
			{...button}
			number={number + 1}
			visited={false}
			disabled={button.disabled}
		/>
	{/each}
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		h3 {
			color: var(--text-header);
			font-size: 21px;
			margin-bottom: 16px;
		}
		p {
			color: var(--text-secondary);
			font-weight: 300;
			margin-bottom: 8px;
			max-width: 542px;
			line-height: 24px;
		}
	}
</style>
