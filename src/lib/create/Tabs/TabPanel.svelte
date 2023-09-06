<script lang="ts">
	import { getContext } from 'svelte';
	import { TABS, type TabsContext } from './Tabs.svelte';

	export let id: string;

	const panel = id;
	const { registerPanel, selectedPanel } = getContext<TabsContext>(TABS);

	registerPanel(panel);
</script>

{#if $selectedPanel === panel}
	<slot />
{/if}
