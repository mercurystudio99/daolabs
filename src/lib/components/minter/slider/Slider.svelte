<script lang="ts">
	export let value: string | number;
	export let id: string;
	export let max: number = 100;
	export let min: number = 0;
	export let step: number = 1;

	$: style = `--value: ${((Number(value) - min) / (max - min)) * 100}%`;
</script>

<input type="range" class="slider" bind:value {id} on:input {style} {max} {min} {step} />

<style lang="scss">
	.slider {
		-webkit-appearance: none;
		background: transparent;
		height: 16px;
		width: 100%;
		--thumb-size: 16px;
		--track-height: 4px;
		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			border: none;
			height: var(--thumb-size);
			width: var(--thumb-size);
			border-radius: 50%;
			background: var(--stroke-player-primary);
			margin-top: -6px;
			cursor: pointer;
		}

		&::-webkit-slider-runnable-track {
			width: 100%;
			height: var(--track-height);
			cursor: pointer;
			background: linear-gradient(
				90deg,
				var(--stroke-player-primary) 0 var(--value),
				#cde5e7 var(--value)
			);
			border-radius: 2px;
		}

		&::-moz-range-thumb {
			border: none;
			height: var(--thumb-size);
			width: var(--thumb-size);
			border-radius: 50%;
			background: var(--stroke-player-primary);
			cursor: pointer;
		}
		&::-moz-range-track {
			width: 100%;
			height: var(--track-height);
			cursor: pointer;
			background: #cde5e7;
			border-radius: 2px;
		}
		&::-moz-range-progress {
			height: var(--track-height);
			background: var(--stroke-player-primary);
		}

		&:focus {
			outline: none;
		}
		&::-ms-thumb {
			border: none;
			height: var(--thumb-size);
			width: var(--thumb-size);
			border-radius: 50%;
			background: var(--stroke-player-primary);
			cursor: pointer;
		}
		&::-ms-track {
			background: transparent;
			border-color: transparent;
			color: transparent;
			width: 100%;
			height: 4px;
			cursor: pointer;
			background: #cde5e7;
			border-radius: 50%;
			border-width: 8px 0;
		}

		&::-ms-fill-lower {
			background: var(--stroke-player-primary);
			border-radius: 2px;
		}
	}
</style>
