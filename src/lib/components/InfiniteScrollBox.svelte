<script lang="ts">
	import { objectToStyleString } from '$utils/string';
	import type * as CSS from 'csstype';

	export let styles: CSS.Properties = {};
	export let ref: HTMLElement = undefined;
	export let loading = false;
</script>

<section class="indicateScroll" style={objectToStyleString(styles)} bind:this={ref} class:loading>
	<slot />
</section>

<style>
	:global(html.lightmode .indicateScroll) {
		--shadow-color: rgba(0, 0, 0, 0.2);
		--background-anim-l0: #fefdfb8c;
		--background-anim-l1: #e7e3dc8c;
	}
	:global(html.darkmode .indicateScroll) {
		--shadow-color: rgba(255, 255, 255, 0.2);
		--background-anim-l0: #1c1b218c;
		--background-anim-l1: #2e2b3c8c;
	}

	.indicateScroll {
		background:
	    /* Shadow Cover TOP */ linear-gradient(
					var(--background-l0) 30%,
					rgba(255, 255, 255, 0)
				)
				center top,
			/* Shadow Cover BOTTOM */ linear-gradient(rgba(255, 255, 255, 0), var(--background-l0) 70%)
				center bottom,
			/* Shadow TOP */
				radial-gradient(farthest-side at 50% 0, var(--shadow-color), rgba(0, 0, 0, 0)) center top,
			/* Shadow BOTTOM */
				radial-gradient(farthest-side at 50% 100%, var(--shadow-color), rgba(0, 0, 0, 0)) center
				bottom;
		background-repeat: no-repeat;
		background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
		background-attachment: local, local, scroll, scroll;
	}

	.loading {
		animation: fade 1s infinite alternate;
	}

	@keyframes fade {
		from {
			background-color: var(--background-anim-l0);
		}
		to {
			background-color: var(--background-anim-l1);
		}
	}

	section {
		max-height: 975px;
		overflow: auto;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	section::-webkit-scrollbar {
		display: none;
	}
</style>
