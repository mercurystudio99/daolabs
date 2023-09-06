<script lang="ts">
	import PopInfo from '$lib/components/PopInfo.svelte';

	export let label: string;
	export let tooltip: string;
</script>

<div class="property-container">
	<div class="label">
		{label}
		<PopInfo message={tooltip} placement="bottom" />
	</div>
	<slot />
</div>

<style lang="scss">
	.property-container {
		display: flex;
		flex-direction: column;
		max-width: 180px;
		.label {
			margin-bottom: 29px;
			display: flex;
			color: var(--text-header);
			font-weight: 500;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 600px) {
		.property-container {
			max-width: 180px !important;
		}
	}
</style>
