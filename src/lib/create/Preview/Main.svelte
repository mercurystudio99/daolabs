<script lang="ts">
	import { setContext } from 'svelte';
	import CashMoney from './CashMoney.svelte';
	import Funding from './Funding.svelte';
	import InfoHeader from './InfoHeader.svelte';
	import Pay from './Pay.svelte';

	setContext('IS_PREVIEW', true);
</script>

<h1 class="title">Preview</h1>
<div class="preview">
	<InfoHeader />
	<CashMoney />
	<Pay />
	<Funding />
</div>

<style>
	.title {
		font-size: 18px;
		color: var(--text-secondary);
		margin-bottom: 0px;
		font-weight: 400;
	}
	div {
		margin-top: 0.5rem;
		box-sizing: border-box;
		border: 1px solid var(--stroke-tertiary);
		padding: 1rem;
	}
</style>
