<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let active: boolean = false;
	export let next: boolean = false;
	export let style: string = null;
	export let errored: boolean = false;

	let stroke = 'var(--secondary)';

	$: if (next) {
		if (errored) {
			stroke = 'var(--failed)';
		} else {
			stroke = 'var(--secondary)';
		}
	} else if (active) {
		stroke = 'var(--active)';
	} else {
		stroke = 'var(--separator)';
	}
</script>

<span class="timeline-dot" {style}>
	{#if active}
		<span class="active">
			<Icon name="checkmark" style="fill: white;" />
		</span>
		<!-- {:else if errored} -->
	{:else if next}
		<svg viewBox="0 0 13 13" class={errored ? 'next next__errored' : 'next'}>
			<!-- if failed at a tasteful cross -->
			{#if errored}
				<line x1="2" y1="2" x2="10" y2="10" stroke="var(--failed)" stroke-width="2" />
				<line x1="2" y1="10" x2="10" y2="2" stroke="var(--failed)" stroke-width="2" />
			{:else}
				<circle
					cx="6"
					cy="6"
					r="6"
					opacity="0.2"
					fill={errored ? 'var(--failed)' : 'var(--secondary)'}
					stroke-width="2"
				/>
			{/if}
		</svg>
	{/if}
	<svg viewBox="0 0 26 26" style="width: 32px; height: 32px;">
		<circle
			cx="13"
			cy="13"
			r="12"
			fill={active ? 'var(--active)' : 'none'}
			{stroke}
			class:loading={next && !errored}
			stroke-width="1.2"
		/>
	</svg>
	<slot />
</span>

<style>
	.timeline-dot {
		display: flex;
		position: relative;
		align-self: baseline;
	}

	.active {
		position: absolute;
		top: 8px;
		left: 5px;
		opacity: 0;
		animation: fade-in 0.3s ease-in-out forwards;
	}

	.next {
		width: 16px;
		height: 16px;
		position: absolute;
		top: 9px;
		left: 9px;
		animation: fade-in 1s ease-in-out infinite alternate;
	}

	.next__errored {
		animation: none;
	}

	.loading {
		stroke-dasharray: 20;
		stroke-dashoffset: 0;
		animation: dash 20s linear infinite;
	}

	@keyframes dash {
		from {
			stroke-dashoffset: 750;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
