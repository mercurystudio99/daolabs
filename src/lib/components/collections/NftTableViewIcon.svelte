<script lang="ts">
	export let active: boolean = false;
</script>

<div class="viewIcon" class:active on:click on:keydown>
	<slot />
</div>

<style>
	.viewIcon {
		width: 32px;
		height: 32px;
		border: 1px solid var(--stroke-secondary);
		padding: 3px;
		display: flex;
		cursor: pointer;
	}

	.active {
		border: 1px solid var(--stroke-action-primary);
	}
</style>
