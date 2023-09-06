<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let warning = '';
</script>

<aside class="container">
	<div class="icon">
		<Icon name="infoCircle" />
	</div>
	<p>
		{#if warning}
			{@html warning}
		{/if}
	</p>
</aside>

<style lang="scss">
	.container {
		margin: 48px 0;
		color: #ff790b;
		letter-spacing: -0.002em;
		border: 0.4px solid #ff790b;
		padding: 16px;
		display: flex;
		font-size: 16px;

		.icon {
			margin-right: 16px;
		}
		p {
			margin: 0;
		}
	}
</style>
