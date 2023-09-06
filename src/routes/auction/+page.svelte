<!-- MOCK DATA -->
<script lang="ts">
	import { modal } from '$stores';
	import Icon from '$lib/components/Icon';
	import Modal from '$lib/components/Modal.svelte';
	import Ongoing from '$lib/auction/Ongoing.svelte';
	import Past from '$lib/auction/Past.svelte';
	import { mockData } from '$lib/auction/mockData';
	import Gallery from '$lib/auction/Gallery.svelte';
	import StatsSection from '$lib/auction/StatsSection.svelte';

	// Today's date in the format of August 11, 2022
	const today = new Date().toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
	let current = mockData.length - 1;

	function previousDay() {
		current -= 1;
		if (current < 0) {
			current = mockData.length - 1;
		}
	}

	function nextDay() {
		current += 1;
		if (current > mockData.length - 1) {
			current = 0;
		}
	}

	$: data = mockData[current];
</script>

<!-- NOTE: Temporary location for auction page, UI code for now. -->
<main>
	<section id="left">
		<h1 class="accent">Banny {data.id}</h1>
		<div class="day">
			{#if current != 0}
				<span on:click={previousDay} on:keydown class="dateArrow">
					<Icon name="circle-chevron-left" />
				</span>
			{/if}
			<h3>
				{data.date}
			</h3>
			{#if current != mockData.length - 1}
				<span on:click={nextDay} on:keydown class="dateArrow">
					<Icon name="circle-chevron-right" />
				</span>
			{/if}
		</div>
		{#if today == data.date}
			<Ongoing {data} />
		{:else}
			<Past {data} />
		{/if}
	</section>
	<section id="right">
		{#if current != 0}
			<span class="left arrow" on:click={previousDay} on:keydown>
				<Icon name="circle-chevron-left" />
			</span>
		{/if}
		<img src={data.img} alt="test" />
		{#if current != mockData.length - 1}
			<span class="right arrow" on:click={nextDay} on:keydown>
				<Icon name="circle-chevron-right" />
			</span>
		{/if}
	</section>
</main>
<StatsSection
	sold={2}
	treasury={'100000000000000000000'}
	bids={mockData.reduce((acc, curr) => acc + curr.bids.length, 0)}
/>
<Gallery images={mockData.map((d) => d.img)} />

<Modal show={$modal} />

<style>
	h1 {
		font-size: 2rem;
	}

	h3 {
		color: var(--text-secondary);
		margin: 0;
	}

	main {
		justify-content: space-between;
		display: flex;
		max-width: 1104px;
		margin: 0 auto;
		margin-top: 40px;
		padding: 20px;
		padding-bottom: 40px;
	}

	.accent {
		color: var(--text-brand-primary);
	}

	.day {
		align-items: center;
		color: var(--text-tertiary);
		display: flex;
		gap: 12px;
	}

	.dateArrow {
		cursor: pointer;
		line-height: 0;
	}

	#right {
		position: relative;
	}

	#right .arrow {
		position: absolute;
		color: var(--text-tertiary);
		top: 50%;
		transform: translateY(-50%);
	}

	#right .left {
		left: 0;
	}

	#right .right {
		right: 0;
	}

	#left,
	#right {
		flex: 0 0 50%;
		max-width: 50%;
	}

	#left {
		max-width: 400px;
	}

	#right img {
		display: block;
		width: 400px;
		margin: 0 auto;
		background-color: var(--background-l1);
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
	}
</style>
