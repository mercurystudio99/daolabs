<script lang="ts">
	import { ChevronUpIcon } from 'svelte-feather-icons';
	import Icon from '$lib/components/Icon';

	export let header;
	export let classes = '';
	export let expandable = true;
	export let arrowBelowHeader = true;
	let isExpanded = true;
</script>

<div class={classes}>
	<section class={'detail-section'} class:expanded={isExpanded}>
		<p class="header">{header}</p>
		{#if expandable && arrowBelowHeader}
			<div class="expand-arrow">
				<div
					class="expand-icon"
					on:keypress={() => (isExpanded = !isExpanded)}
					on:click={() => (isExpanded = !isExpanded)}
				>
					{#if isExpanded}
						<ChevronUpIcon size="1x" />
					{:else}
						<Icon name="chevronDown" />
					{/if}
				</div>
			</div>
		{/if}
		{#if isExpanded}
			<slot />
		{/if}
	</section>
	{#if expandable && !arrowBelowHeader}
		<div class="expand-arrow">
			<div class="expand-icon" on:click={() => (isExpanded = !isExpanded)} on:keydown>
				{#if isExpanded}
					<ChevronUpIcon size="1x" />
				{:else}
					<Icon name="chevronDown" />
				{/if}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.detail-section {
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--stroke-secondary);
		margin-bottom: 16px;

		.header {
			color: var(--text-header);
		}
	}

	.full-border {
		border: 1px solid var(--stroke-secondary);
		border-radius: 10px;
		padding: 16px 16px 8px;
	}
	.expand-arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 12px;

		.expand-icon {
			background-color: var(--stroke-secondary);
			border-radius: 50px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			cursor: pointer;
			font-size: 16px;
		}
	}
	.expanded {
		padding-bottom: 16px;
	}
</style>
