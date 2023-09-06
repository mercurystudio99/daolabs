<script>
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import { storeContextKey } from '../../context';

	const store = getContext(storeContextKey);
	const dispatch = createEventDispatcher();

	const hours = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
	const minutes = ['00', '15', '30', '45'];
	const meridiem = ['AM', 'PM'];

	const select = (m, hour, minute) => {
		store.setTime({ hour, minute, meridiem: m });
		dispatch('select', { day: $store.selected });
	};

	onMount(() => {
		const selected = document.getElementsByClassName('selectedTime');
		if (selected.length > 0) {
			selected[0].scrollIntoView();
		}
	});
</script>

<div class="timepicker">
	<div class="wrapper">
		{#each meridiem as m}
			{#each hours as hour}
				{#each minutes as minute}
					<span
						class="time"
						class:selectedTime={$store.hour == hour &&
							$store.minute == minute &&
							$store.meridiem === m}
						class:disabled={false}
						on:click={() => select(m, hour, minute)}
						on:keydown
					>
						{`${hour}:${minute} ${m}`}
					</span>
				{/each}
			{/each}
		{/each}
	</div>
</div>

<style lang="scss">
	.timepicker {
		overflow: hidden;
		border-left: 0.5px solid var(--sc-theme-calendar-colors-border);
		background: var(--sc-theme-calendar-colors-background-primary);
		height: 331px;
		align-self: center;

		.wrapper {
			display: flex;
			flex-direction: column;
			height: 100%;
			gap: 2px;
			overflow-y: scroll;
			font-size: var(--sc-theme-calendar-font-regular);
			color: var(--sc-theme-calendar-colors-text-primary);

			.time {
				background-color: var(--sc-theme-calendar-colors-background-primary);
				padding: 6px 12px;
				white-space: nowrap;
				cursor: pointer;
				text-align: center;

				&:hover {
					background: var(--sc-theme-calendar-colors-background-hover);
				}
			}

			.selectedTime {
				background: var(--sc-theme-calendar-colors-background-highlight);
				color: var(--sc-theme-calendar-colors-text-highlight);
				opacity: 1;

				&:hover {
					background: var(--sc-theme-calendar-colors-background-highlight);
				}
			}
			.disabled {
				background: var(--sc-theme-calendar-colors-border);
				opacity: var(--sc-theme-calendar-grid-disabledOpacity);
				cursor: default;
				&:hover {
					background: var(--sc-theme-calendar-colors-border);
				}
			}
		}
	}
</style>
