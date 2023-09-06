<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import { formattedNum } from '$utils/formatNumber';

	export let issuanceRate: number;

	const pattern = '^[\\d,]*';
	let formatted = formattedNum(issuanceRate);
	let inputRef: HTMLInputElement | undefined;
	let valid = true;

	$: {
		if (formatted === '') {
			issuanceRate = 0;
			formatted = '';
		} else {
			issuanceRate = parseInt(formatted.replace(/,/g, ''));
			if (isNaN(issuanceRate)) {
				issuanceRate = 0;
			}
			formatted = formattedNum(issuanceRate);
		}
		valid = inputRef?.checkValidity();
	}
</script>

<div>
	<div class="label">
		<label for="initialMintRate"><small>*</small> Initial mint rate </label>
		<PopInfo
			message="The number of project tokens minted when 1 ETH is contributed."
			placement="top"
		/>
	</div>
	<Input id="initialMintRate" bind:inputRef bind:value={formatted} {pattern}>
		<div slot="addon">
			<span class="addon">tokens per ETH distributed </span>
		</div>
	</Input>
	{#if inputRef && !valid}
		<div class="error">
			{inputRef?.validationMessage}
		</div>
	{/if}
</div>

<style lang="scss">
	small {
		font-size: 8px;
		color: red;
		vertical-align: text-top;
	}

	div {
		margin-bottom: 10px;
	}
	.label {
		display: flex;
		align-items: center;
	}
	.addon {
		font-weight: 300;
	}
</style>
