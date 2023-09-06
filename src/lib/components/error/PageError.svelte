<script lang="ts">
	import Icon from '$lib/components/Icon';
	import Button from '$lib/components/Button.svelte';

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let customMessage: string = undefined;

	const goHome = async () => {
		await goto(`/`);
		close();
	};

	type PageErrorDetails = { status: number; message: String; icon: string };
	let errorDetails: PageErrorDetails = <PageErrorDetails>{};

	$: {
		if (customMessage) {
			errorDetails.message = `Sorry, ${customMessage}`;
			errorDetails.icon = 'dog';
		} else if ($page.status == 500) {
			errorDetails.status = $page.status;
			errorDetails.message = `Sniff... Sorry, ${$page.error.message}.`;
			errorDetails.icon = 'cat';
		} else if ($page.status != 200) {
			errorDetails.status = $page.status;
			errorDetails.message = `Oops! Sorry, ${$page.error.message}.`;
			errorDetails.icon = 'dog';
		}
	}
</script>

<main>
	{#if errorDetails}
		<h1>
			{#if errorDetails.status}
				{errorDetails.status}
			{/if}
			<p>{errorDetails.message}</p>
		</h1>

		<Icon name={errorDetails.icon} />
	{/if}
	<div class="home">
		<Button size="md" on:click={goHome}>GO HOME</Button>
	</div>
</main>

<style lang="scss">
	main {
		margin: 34px 180px 0px;
		display: flex;
		flex-direction: column;
		justify-content: baseline;
		align-items: center;
		text-align: center;
		h1 {
			color: var(--text-brand-primary);
		}
		.home {
			margin-top: 32px;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 800px) {
		main {
			margin: 70px 20px;
		}
	}
</style>
