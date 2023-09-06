<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let fullHeight = false;
	export let fullWidth = false;
	export let fullScreen = false;
	export let overlay = false;
	export let height: number = '' as any;
</script>

<div
	class="loading"
	class:fullHeight
	class:fullWidth
	class:fullScreen
	class:overlay
	style="height: {height}px;"
>
	<Icon name="loading" spin />
</div>

<style>
	.loading {
		text-align: center;
		font-size: 2rem;
		color: var(--text-header);
	}
	.loading {
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
	}
	.loading.fullHeight {
		height: 100%;
	}
	.loading.fullWidth {
		width: 100%;
	}
	.loading.fullScreen {
		width: 100%;
		height: 100vh;
	}
	.loading.overlay {
		position: fixed;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.66);
	}
</style>
