<script lang="ts">
	import { onMount } from 'svelte';
	import * as Sentry from '@sentry/svelte';
	import { BrowserTracing } from '@sentry/tracing';
	import MobileHeader from '$lib/components/MobileHeader.svelte';
	import Header from '$lib/components/Header.svelte';
	import { loadLocale } from '$lib/provider/LanguageProvider';
	import Intl from '$lib/provider/Intl.svelte';
	import OnboardProvider from '$lib/provider/OnboardProvider.svelte';
	import { loadResolvedEns } from '$stores/resolved-ens';
	import ProgressBarProvider from '$lib/provider/ProgressBarProvider.svelte';

	onMount(async () => {
		await loadLocale();
		Sentry.init({
			dsn: 'https://5654964c9e284a4bab05ccae91a0010c@o4504140182061056.ingest.sentry.io/4504167652327424',
			integrations: [new BrowserTracing()],
			tracesSampleRate: 1.0,
		});
		loadResolvedEns();
	});
</script>

<svelte:head>
	<title>MOVEMENT</title>
</svelte:head>

<Intl>
	<OnboardProvider>
		<ProgressBarProvider>
			<main>
				<div class="body">
					<Header />
					<slot />
					<MobileHeader />
				</div>
			</main>
		</ProgressBarProvider>
	</OnboardProvider>
</Intl>

<style>
	main {
		flex-grow: 1;
		margin: 0 auto;
		box-sizing: border-box;
		min-height: 100vh;
	}
	.body {
		min-height: 100vh;
	}
</style>
