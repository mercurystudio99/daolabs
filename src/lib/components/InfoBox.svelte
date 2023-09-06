<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let info = '';
	export let classes = '';
	export let id = '';
</script>

<aside {...$$restProps} class={classes} {id}>
	<div class="icon">
		<Icon name="infoCircle" />
	</div>
	<p>
		{#if info}
			{@html info}
		{/if}
		<slot />
	</p>
	<slot name="action" />
</aside>

<style lang="scss">
	aside {
		background-color: var(--background-l1);
		padding: 20px 20px;
		font-weight: 300;
		display: flex;
		align-items: flex-start;
		border-radius: var(--radius-lg);
	}

	p {
		margin: 0;
	}

	.icon {
		margin-right: 10px;
		width: 18px;
		height: 18px;
	}

	.margin {
		margin-bottom: 32px;
	}

	.smMargin {
		margin-bottom: 16px;
	}
</style>
