<script lang="ts">
	export let style: string = null;
	export let active: boolean = false;
</script>

<span class="timeline-connector" {style} class:active />

<style>
	.timeline-connector {
		width: 2px;
		background-color: var(--separator);
		flex-grow: 1;
	}

	.active {
		background-color: var(--active);
		transition: background-color 1s ease-in;
	}

	@keyframes slide-down {
		0% {
			height: 0;
		}
		100% {
			height: 100%;
		}
	}
</style>
