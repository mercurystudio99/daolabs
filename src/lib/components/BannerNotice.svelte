<script lang="ts">
	export let type: 'info' | 'active' = 'info';
</script>

<aside class={type} id="bannerNotice">
	<slot />
</aside>

<style>
	aside {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
		width: 100%;
		color: var(--text-over-action-primary);
		font-weight: 300;
		text-align: center;
	}

	:global(#bannerNotice a) {
		color: unset;
	}

	.info {
		background-color: var(--background-brand-primary);
	}

	.active {
		background-color: var(--background-action-primary);
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 768px) {
		aside {
			margin-top: 68px;
		}
	}
</style>
