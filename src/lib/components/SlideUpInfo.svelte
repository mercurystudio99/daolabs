<script lang="ts">
	import Icon from './Icon';

	export let onClick = () => {};
	export let info = 'Copied';
	export let iconName = 'copy';

	let show = false;

	function handleClick() {
		onClick();
		show = true;
		setTimeout(() => {
			show = false;
		}, 1500);
	}
</script>

<span on:click={handleClick} on:keydown style="position: relative;">
	{#if show}
		<span class="slide-top">
			<Icon name={iconName} />
			{info}
		</span>
	{/if}
	<span class:clicked={show}>
		<slot />
	</span>
</span>

<style>
	.slide-top {
		display: flex;
		font-size: 12px;
		position: absolute;
		top: 0;
		left: 0;
		min-width: 60px;
		animation: slide-top 0.8s linear both;
	}

	.clicked {
		fill-opacity: 0.8;
		transform: scale(0.9);
	}

	@keyframes slide-top {
		0% {
			transform: translateY(-20px);
		}
		100% {
			transform: translateY(-80px);
			opacity: 0;
		}
	}
</style>
