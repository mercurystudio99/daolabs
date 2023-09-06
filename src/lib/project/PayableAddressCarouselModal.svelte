<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import Icon from '$lib/components/Icon';
	import Popover from '$lib/components/Popover.svelte';
	import PayableAddress from './PayableAddress.svelte';

	export let payableAddresses: any[];
	export let userDeployedPayableAddress = -1;
</script>

<main>
	<Carousel items={payableAddresses} startIndex={userDeployedPayableAddress} let:item let:index>
		<PayableAddress event={item?.deployETHERC20ProjectPayerEvent}>
			<span slot="extra">
				{#if payableAddresses.length > 1}
					<!-- eslint-disable-next-line @typescript-eslint/restrict-plus-operands -->
					{index + 1}/{payableAddresses.length}
				{/if}
				{#if index === userDeployedPayableAddress}
					<Popover message="This address is deployed by you.">
						<!-- TODO user icon seems to be lost. -->
						<Icon name="user" />
					</Popover>
				{/if}
			</span>
		</PayableAddress>
	</Carousel>
</main>

<style>
	main {
		padding: 2rem;
	}
</style>
