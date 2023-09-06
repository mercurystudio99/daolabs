<script lang="ts">
	import AlertText from '$lib/components/AlertText.svelte';
	import CurveGraph from '$lib/components/CurveGraph.svelte';
	import Range from '$lib/components/Range.svelte';
	import Toggle from '$lib/components/Toggle.svelte';

	export let disabled = false;
	export let redemptionRate: number = 100;
	export let checked = redemptionRate !== 100;

	let rangeValue = [redemptionRate];
	let isOpenToggle = false;

	$: {
		redemptionRate = rangeValue[0];
	}

	const openToggle = () => {
		isOpenToggle = !isOpenToggle;
	};
</script>

<header>
	<Toggle id="redemption" bind:checked {disabled}
		><h3>
			Redemption rate {#if !disabled && redemptionRate === 100}
				<span>({disabled ? '' : '100%'})</span>
			{/if}
		</h3></Toggle
	>
</header>
{#if checked}
	<Range bind:values={rangeValue} step={0.5} />
{/if}
<p>The redemption rate determines the amount of overflow each token can be redeemed for.</p>
<div class="toggle-link" on:click={openToggle} on:keydown>
	<svg
		viewBox="64 64 896 896"
		focusable="false"
		class="icon"
		width="1em"
		height="1em"
		fill="currentColor"
		aria-hidden="true"
		style={`transform: rotate(${isOpenToggle ? 90 : 0}deg);`}
		><path
			d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"
		/></svg
	>
	How do I set the redemption rate?
</div>
{#if isOpenToggle}
	<p>
		On a lower redemption rate, redeeming a token increases the value of each remaining token,
		creating an incentive to hold tokens longer than other holders.
	</p>
	<p>
		A redemption rate of 100% means all tokens will have equal value regardless of when they are
		redeemed.
	</p>
	<p>
		Learn more in this <a href="https://youtu.be/dxqc3yMqi5M">short video</a>.
	</p>
{/if}
{#if disabled}
	<AlertText>
		Disabled when your funding cycle's distribution limit is <b>No limit</b> (infinite)
	</AlertText>
{/if}
<div class="container">
	<CurveGraph rate={redemptionRate} />
</div>

<style lang="scss">
	.toggle-link {
		display: flex;
		align-items: center;
		cursor: pointer;
		margin-bottom: 10px;
		.icon {
			margin-right: 10px;
		}
	}
	:global(.dcg-container) {
		background: var(--background-l2) !important;
	}
	.container {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-top: 20px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		.container {
			flex-direction: column;
		}
	}
</style>
