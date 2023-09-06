<script lang="ts">
	import LightningIcon from '$lib/components/minter/icons/LightningIcon.svelte';

	export let boost: Attributes.Boost;
	// If boost.type is not percentage, we need to know how to show the ring.
	export let percentage: number = undefined;

	$: style = `--percentage: ${percentage || boost.value};`;
</script>

<div class="container">
	<div class="boost-wrap" {style}>
		<div class="inner-circle">
			<LightningIcon />
		</div>
	</div>
	<span class="description">
		{boost.label}
		+{boost.value}{boost.type === 'boost_percentage' ? '%' : ''}
	</span>
</div>

<style>
	.container {
		width: 60px;
		display: flex;
		flex-direction: column;
	}

	.boost-wrap {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		padding: 5px;
		background: radial-gradient(
				closest-side,
				var(--background-l0) 80%,
				transparent 0 99.9%,
				var(--background-l0) 0
			),
			conic-gradient(#7fcec9 calc(var(--percentage) * 1%), var(--background-l0) 0);
	}

	.inner-circle {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--background-l0);
		border: 1px solid var(--stroke-action-secondary);
		z-index: 1px;
	}

	.description {
		color: var(--text-tertiary);
		text-align: center;
	}
</style>
