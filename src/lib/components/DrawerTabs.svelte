<script lang="ts">
	import Trans from './Trans.svelte';

	export let tabs = [];
	export let currentTab = 0;
</script>

<div class="tabs">
	{#each tabs as tab, index}
		<div class="wrapper">
			<button class:selected={index === currentTab} on:click={() => (currentTab = index)}>
				<Trans>{tab}</Trans>
			</button>
		</div>
	{/each}
</div>

<style lang="scss">
	.tabs {
		margin: 32px 0;
		display: flex;
		gap: 50px;
		border-bottom: 1px solid var(--stroke-tertiary);
		gap: 2rem;

		.wrapper {
			button {
				padding: 0;
				margin: 0;
				padding-bottom: 18px;
				color: var(--text-secondary);
				border: none;
				background: transparent;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: space-between;
				white-space: nowrap;
				width: fit-content;
			}
			.selected {
				border-bottom: 1px solid var(--accent);
				color: var(--accent);
				font-weight: 500;
				margin-bottom: -1px;
			}
		}
	}
</style>
