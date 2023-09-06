<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Skeleton from './Skeleton.svelte';

	export let date: number;

	let days: number;
	let hours: number;
	let minutes: number;
	let seconds: number;

	let interval: ReturnType<typeof setInterval>;

	function countDown(endDate: number) {
		const second = 1000;
		const minute = second * 60;
		const hour = minute * 60;
		const day = hour * 24;

		interval = setInterval(function () {
			const now = new Date().getTime();
			const distance = endDate - now;

			days = Math.floor(distance / day);
			hours = Math.floor((distance % day) / hour);
			minutes = Math.floor((distance % hour) / minute);
			seconds = Math.floor((distance % minute) / second);

			if (distance < 0) {
				// TODO WHAT TO DO
				// do something later when date is reached
				clearInterval(interval);
			}
			//seconds
		}, 1000);
	}

	onMount(() => {
		countDown(date);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="container">
	{#if seconds !== undefined}
		<div id="countdown">
			<ul>
				<li><span id="days">{days} </span>days</li>
				<li><span id="hours">{hours}</span>Hours</li>
				<li><span id="minutes">{minutes} </span> Minutes</li>
				<li><span id="seconds">{seconds} </span>Seconds</li>
			</ul>
		</div>
	{:else}
		<Skeleton height="60px" width="250px" style="margin-top: 20px" />
	{/if}
</div>

<style>
	.container {
		margin: 0 auto;
		margin-top: 1em;
		text-align: center;
	}

	ul {
		padding: 0;
	}

	li {
		display: inline-block;
		font-size: 0.75em;
		list-style-type: none;
		padding: 1em;
		text-transform: uppercase;
		color: var(--text-tertiary);
	}

	li span {
		color: var(--text-primary);
		display: block;
		font-size: 1.8rem;
	}
</style>
