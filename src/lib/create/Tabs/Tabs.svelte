<script lang="ts" context="module">
	export const TABS = {};
	export type TabsContext = {
		registerTab: (tab: string) => void;
		registerPanel: (panel: string) => void;
		selectTab: (tab: string) => void;
		selectedTab: Writable<string>;
		selectedPanel: Writable<string>;
	};
</script>

<script lang="ts">
	import { setContext, onDestroy } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const tabs: string[] = [];
	const panels: string[] = [];
	const selectedTab = writable<string>(null);
	const selectedPanel = writable<string>(null);

	setContext(TABS, {
		registerTab: (tab: string) => {
			tabs.push(tab);
			selectedTab.update((current) => current || tab);

			onDestroy(() => {
				const i = tabs.indexOf(tab);
				tabs.splice(i, 1);
				selectedTab.update((current) =>
					current === tab ? tabs[i] || tabs[tabs.length - 1] : current,
				);
			});
		},

		registerPanel: (panel: string) => {
			panels.push(panel);
			selectedPanel.update((current) => current || panel);

			onDestroy(() => {
				const i = panels.indexOf(panel);
				panels.splice(i, 1);
				selectedPanel.update((current) =>
					current === panel ? panels[i] || panels[panels.length - 1] : current,
				);
			});
		},

		selectTab: (tab: string) => {
			selectedTab.set(tab);
			selectedPanel.set(tab);
		},

		selectedTab,
		selectedPanel,
	});
</script>

<div class="tabs">
	<slot />
</div>
