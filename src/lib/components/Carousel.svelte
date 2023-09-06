<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let items: any[] = [];
	export let startIndex = 0;
	export let index = startIndex;
	export let round = true;
	$: item = items[index];

	function mod(n: number, m: number) {
		return ((n % m) + m) % m;
	}
</script>

<div class="carousel">
	{#if items?.length > 1}
		<div class="controls">
			<span
				class="left"
				class:hidden={index === 0 && !round}
				on:click={() => {
					index = mod(index - 1, items.length);
				}}
				on:keydown
			>
				<Icon name="circle-chevron-left" />
			</span>
			<span
				class="right"
				class:hidden={index === items.length - 1 && !round}
				on:click={() => {
					index = mod(index + 1, items.length);
				}}
				on:keydown
			>
				<Icon name="circle-chevron-right" />
			</span>
		</div>
	{/if}
	<div class="item">
		<slot {item} {index} />
	</div>
</div>

<style lang="scss">
	.carousel {
		position: relative;
		max-width: 100%;
	}

	.controls {
		.left,
		.right {
			position: absolute;
			flex-grow: 0;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			background: var(--background-l1);
			border-radius: 50%;
			top: 50%;
			:global(svg) {
				cursor: pointer;
				width: 1rem;
				color: var(--text-primary);
				z-index: 10;
			}
			:hover {
				transform: scale(1.1);
				transition: transform 0.2s ease-in-out;
			}
		}
		.left {
			left: -0.5rem;
		}
		.right {
			right: -0.5rem;
		}
		.hidden {
			display: none;
		}
	}

	.item {
		margin: 0 auto;
	}
</style>
