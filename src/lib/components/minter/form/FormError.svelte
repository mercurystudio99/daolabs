<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let error = '';
</script>

{#if error}
	<div class="error">
		<Icon name="exclamationCircle" />
		<p>{error}</p>
	</div>
{/if}

<style lang="scss">
	.error {
		display: flex;
		flex-direction: row;
		size: 16px;
		padding: 0px;
		gap: 16px;
		margin-top: 6px;
		color: var(--text-failure);
		p {
			min-height: 16px;
			font-weight: 400;
			font-size: 12px;
			line-height: 16px;
			margin-bottom: 0;
		}
	}
</style>
