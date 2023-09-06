<script lang="ts">
	import { darkMode, theme } from '$stores';
	import type { SVGAttributes } from 'svelte/elements';

	let svgProps = {
		width: 24,
		height: 24,
		viewBox: '0 0 24 24',
		fill: 'none',
		'stroke-width': 2,
		'stroke-linecap': 'round' as SVGAttributes<SVGPathElement>['stroke-linecap'],
		'stroke-linejoin': 'round' as SVGAttributes<SVGPathElement>['stroke-linejoin'],
		stroke: 'var(--accent)',
		xmlns: 'http://www.w3.org/2000/svg',
	};

	$: {
		if ($darkMode || $theme) {
			svgProps.stroke = 'var(--accent)';
			svgProps['stroke-width'] = 2;
		} else {
			svgProps.stroke = 'var(--text-tertiary)';
			svgProps['stroke-width'] = 1;
		}
	}
</script>

<svg {...svgProps}>
	{#if $darkMode || $theme}
		<circle cx="12" cy="12" r="10" />
		<circle cx="12" cy="12" r="4" />
	{:else}
		<circle cx="12" cy="12" r="10" stroke="var(--text-tertiary)" />
		<circle cx="12" cy="12" r="2" stroke="var(--text-tertiary)" />
		<circle cx="12" cy="12" r="4" stroke="var(--text-tertiary)" />
		<circle cx="12" cy="12" r="8" stroke="var(--text-tertiary)" />
	{/if}
</svg>
