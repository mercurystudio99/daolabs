<!-- 
	@component

	TLDR: A good website to find new icons with copy-to-clipboard svg is https://tabler-icons.io/
	
This is the Icon component, it provides different ways to load icons.

- **antd** Icons borrowed from antd are first in the svgs file, `svgByName`. These icons only need a list of path values, 
	to add a new antd icon to the list copy what's inside the svg tag and remove the `<path d="" />` markup leaving only the d value. 
	All icons can be found here: https://ant.design/components/icon/.
- **any icon** can be added to the `svgByName` file by copying the svg's properties into a svg key, and the incased svg markup in a string in the key markup. 
	Scroll down in the file to see examples.
- **"sensible" icon** icons copied from tabler-icons, feather, or somewhere else that share the properties defined in sensibleProps. 
	Needs a key with sensible set to true, and either the markup or paths field. Again, scroll in the `svgByName` file to see examples.
- **lazy loaded icon** larger icons that live in their own components alongside this file. File must be prefixed with `Icon{name}` to adhere with svelte's lazy loading.

If we want to stick to antd icons and use more of them, we could potentially just use the https://github.com/ant-design/ant-design-icons/tree/master/packages/icons-svg/svg 
package that comes with a few helper functions.

Or, we could stick all our icons in separate svg files and lazy load them. 🤷‍♀️
 -->
<script lang="ts">
	import { capitalize } from '$utils/string';
	// eslint-disable-next-line import/default, import/no-named-as-default, import/no-named-as-default-member
	import svgs from './svgByName';
	import { type IconType, type IconName, directions } from './types';
	import type { SVGAttributes } from 'svelte/elements';
	import type { SvelteComponent } from 'svelte';

	export let name: IconName = 'caret';
	export let direction = 'n';
	export let loading = false;
	export let spin = false;
	export let style = '';
	export let viewBox = '64 64 896 896';

	// Either load from the common file of icon data
	let paths: IconType;
	// Or, if a larger svg, lazy load the component when needed
	const lazyLoaders = ['instagramColor', 'jsonFile', 'metamask', 'sushiswap', 'cat', 'dog'];

	let icon: SvelteComponent;
	let rotation = 0;

	async function load(filename: string) {
		// type as svelete component
		const module = (await import(`./Icon${capitalize(filename)}.svelte`)) as {
			default: SvelteComponent;
		};
		icon = module.default;
	}

	$: {
		paths = svgs[name] as string[] | undefined;
		// If not in our icon file, check if it can be lazy loaded
		if (!paths) {
			if (lazyLoaders.includes(name)) {
				load(name).catch((e) => console.error(e));
			}
		}
	}
	$: {
		const chosenDirection = directions.indexOf(direction);
		if (chosenDirection === -1) {
			console.error(`Invalid direction ${direction} for icon ${name}`);
		} else {
			rotation = chosenDirection * 45;
		}
	}

	// Afore mentioned https://tabler-icons.io adhere to the props below, so do https://feathericons.com/
	const sensibleProps = {
		fill: 'none',
		viewBox: '0 0 24 24',
		stroke: 'currentColor',
		'stroke-width': '2',
		'stroke-linecap': 'round' as SVGAttributes<SVGPathElement>['stroke-linecap'],
		'stroke-linejoin': 'round' as SVGAttributes<SVGPathElement>['stroke-linejoin'],
	};
</script>

{#if Array.isArray(paths)}
	<svg
		{...$$restProps}
		class="antd"
		on:click
		class:spin
		class:loading
		width="1em"
		height="1em"
		{viewBox}
		focusable="false"
		aria-hidden="true"
		style="{rotation !== 0 ? `transform: rotate(${rotation}deg);` : ''}{style}"
	>
		>
		{#each paths as path}
			<path d={path} />
		{/each}</svg
	>
{:else if typeof paths === 'object'}
	<svg
		width="1em"
		height="1em"
		class:loading
		class:spin
		{...paths.sensible ? sensibleProps : {}}
		{...paths.svg || {}}
		{...$$restProps}
		style="{rotation !== 0 ? `transform: rotate(${rotation}deg);` : ''} {paths.svg?.style ||
			''} {style}"
		xmlns="http://www.w3.org/2000/svg"
	>
		{#if paths.markup}
			<g>
				{@html paths.markup}
			</g>
		{:else if paths.paths}
			{#each paths.paths as path}
				<path d={path} />
			{/each}
		{/if}
	</svg>
{:else if icon}
	<svelte:component this={icon} {...$$props} />
{/if}

<style>
	svg {
		z-index: 0;
		fill: currentColor;
		transition: all 0.3s ease-out;
		overflow: visible;
	}

	/* A class that spins the icon */
	.spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.antd {
		margin-right: 2px;
	}

	:global(svg.loading) {
		animation: fade 1s infinite;
	}

	@keyframes fade {
		0% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.5;
		}
	}
</style>
