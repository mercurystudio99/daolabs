<script lang="ts">
	import CloseButton from '$lib/components/CloseButton.svelte';

	export let title: string;
	export let icon: any = '';
	export let closable = false;
	// export let id: string;

	let display = true;
	function closeCard() {
		display = false;
	}

	// let display = $session.cardDisplayState[id] === undefined || $session.cardDisplayState[id];
	// function closeCard() {
	// 	display = false;
	// 	$session.cardDisplayState[id] = false;
	// }
</script>

{#if display}
	<div class="basic-card">
		{#if closable}
			<CloseButton on:click={closeCard} size="0.75rem" />
		{/if}
		<h3 class="title">
			{title}
			{#if icon}
				<svelte:component this={icon} size="1x" />
			{/if}
		</h3>
		<slot />
	</div>
{/if}

<style lang="scss">
	.basic-card {
		padding: 2rem;
		margin-bottom: 16px;
		background: var(--background-l2);
		box-shadow: var(--background-l1) 10px 10px;
		border-radius: 1px;
		stroke: none;
		color: var(--text-primary);
		position: relative;

		.title {
			color: var(--text-header);
			font-weight: 400;
			margin: 0;
			margin-bottom: 10px;
		}
	}
</style>
