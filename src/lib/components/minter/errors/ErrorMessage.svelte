<script lang="ts">
	export let error: string;
</script>

<div class="error">
	<small>{error}</small>
</div>

<style>
	.error {
		color: var(--text-failure);
	}
</style>
