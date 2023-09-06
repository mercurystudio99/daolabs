<script lang="ts">
	import { t } from '$lib/translations';
	import { darkMode } from '$stores';
	import GasEstimateFunctions from '$lib/components/GasEstimatesFunctions.svelte';
	import ConnectButton from './ConnectButton.svelte';
	import DarkmodeToggle from './DarkmodeToggle.svelte';
	import LanguageSelectDropdown from './LanguageSelectDropdown.svelte';
	import ResourceDropdown from './ResourceDropdown.svelte';
</script>

<header>
	<nav>
		<a href="/" style="display: inline-block;">
			<img
				src={$darkMode ? '/images/juice_logo-od.png' : '/images/juice_logo-ol.png'}
				alt="Juicebox logo"
				style="height: 40px;"
			/>
		</a>
		<a href="/projects">{$t('common.Treasuries')}</a>
		<a href="/collections">{$t('common.Collections')}</a>
		<a href="/faq">{$t('common.FAQ')}</a>
		<a href="https://discord.gg/daolabs" target="_blank" rel="noreferrer">{$t('common.Discord')}</a>
		<ResourceDropdown />
	</nav>
	<div class="right-nav">
		<GasEstimateFunctions />
		<LanguageSelectDropdown />
		<DarkmodeToggle />
		<ConnectButton />
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--background-l0);
		height: 64px;
		padding: 0 50px;
		color: var(--text-primary);
	}

	nav {
		flex: 1 1 0%;
		gap: 24px;
		line-height: 64px;
		display: flex;
	}

	nav a {
		cursor: pointer;
		align-items: center;
		font-weight: 400;
		color: var(--text-primary);
		padding: 0px 0px;
	}

	nav a:first-of-type {
		padding: 0px;
	}

	.right-nav {
		display: flex;
		gap: 26px;
		align-items: center;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 767px) {
		header {
			display: none !important;
		}
	}
</style>
