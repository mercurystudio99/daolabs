<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import FormInput from '../form/FormInput.svelte';

	export let addTargetSupply: (supply: number) => void;
	export let collectiontSupply: number;

	let targetSupply = collectiontSupply;
	let showInput = !collectiontSupply;

	const confirm = () => {
		if (showInput) {
			addTargetSupply(targetSupply);
			collectiontSupply = targetSupply;
		}
		showInput = !showInput;
	};
</script>

<h4>Target supply</h4>
{#if showInput}
	<span class="add-text">
		This is the intended supply of the collection. The minter will add the proposed added assets and
		notify you if you are short. This is helpful for generative collections where subpopulations are
		tweaked yet a total collection number is important.
	</span>
	<FormInput
		id="target-supply"
		label="Target supply"
		info="Tooltip text"
		placeholder="100"
		description="The target number of items to be minted for the collection."
		bind:value={targetSupply}
		type="number"
	/>
{:else}
	<span class="saveSupply">{targetSupply}</span>
{/if}
<Button size="md" type={!targetSupply ? 'tertiary' : 'primary'} on:click={confirm}>
	{showInput ? 'Add' : 'Edit'}
</Button>

<style lang="scss">
	h4 {
		margin-bottom: 16px;
		color: var(--text-header);
		font-weight: 400;
		font-size: 16px;
	}
	span {
		color: var(--text-secondary);
		font-weight: 300;
		margin-bottom: 16px;
	}
</style>
