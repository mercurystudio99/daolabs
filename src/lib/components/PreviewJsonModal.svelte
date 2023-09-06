<script lang="ts">
	import Codemirror from '$lib/components/minter/script-editor/Codemirror.svelte';
	import { objectToStyleString } from '$utils/string';
	import type * as CSS from 'csstype';

	export let json: string;
	export let styles: CSS.Properties = {
		minHeight: '200px',
	};
</script>

<section style={objectToStyleString(styles)}>
	{#if json}
		{#key json}
			<Codemirror bind:value={json} readOnly language="json" />
		{/key}
	{/if}
</section>

<style>
	section {
		width: min(500px, 75vw);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
