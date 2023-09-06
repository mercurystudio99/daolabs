<script lang="ts">
	import { darkMode } from '$stores';
	import Icon from '$lib/components/Icon';
	import { toggleTheme } from '$lib/utils/darkmodeToggleUtils';
	import GasEstimateFunctions from '$lib/components/GasEstimatesFunctions.svelte';
	import clickOutsideDirective from '$utils/clickOutside';
	import LanguageSelectDropdown from './LanguageSelectDropdown.svelte';
	import ConnectButton from './ConnectButton.svelte';

	import ResourceDropdown from './ResourceDropdown.svelte';

	let showMenu = false;

	const closeMenu = () => {
		showMenu = false;
	};
</script>

<header>
	<div class="navigation">
		<a href="/" style="display: inline-block;"
			><img
				src={$darkMode ? '/images/juice_logo-od.png' : '/images/juice_logo-ol.png'}
				alt="Juicebox logo"
				style="height: 30px;"
			/></a
		>
		{#if !showMenu}
			<span
				role="img"
				aria-label="menu"
				on:click={() => {
					showMenu = !showMenu;
				}}
				on:keydown
			>
				<Icon name="hamburger" />
			</span>
		{:else}
			<span role="img" aria-label="menu">
				<Icon name="close" />
			</span>
		{/if}
	</div>

	<ConnectButton />

	{#if showMenu}
		<div class="dropdown" use:clickOutsideDirective on:clickOutside={closeMenu}>
			<nav>
				<a href="/projects" on:click={closeMenu}>Projects</a>
				<a href="/" on:click={closeMenu}>FAQ</a>
				<a href="https://discord.gg/daolabs" target="_blank" rel="noreferrer" on:click={closeMenu}
					>Discord</a
				>
				<ResourceDropdown isMobile />
			</nav>
			<ul class="actions">
				<li><GasEstimateFunctions /></li>
				<li><LanguageSelectDropdown /></li>
				<li on:click={toggleTheme} on:keydown>
					<Icon name={$darkMode ? 'sun' : 'moon'} />
					{$darkMode ? 'Light' : 'Dark'} theme
				</li>
				<li>
					<Icon name="message" /><a
						class="quiet"
						href="https://auditor.typeform.com/to/REMUTIbQ?resolution=720x761&amp;referrer=stoned-banny#"
						target="_blank"
						rel="noopener noreferrer"
						on:click={closeMenu}>Give feedback</a
					>
				</li>
			</ul>
		</div>
	{/if}
</header>

<style>
	a {
		cursor: pointer;
		font-weight: 600;
		color: var(--text-primary);
	}

	header {
		z-index: 1;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
		background: var(--background-l0);
		padding: 10px 20px;
		width: 100vw;
		position: fixed;
		top: 0;
	}

	nav {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding-left: 10px;
		padding-top: 14px;
		margin-left: 23px;
	}

	span[role='img'] {
		color: var(--text-primary);
		font-size: 20px;
		padding-top: 8px;
		padding-left: 18px;
		margin-top: 1px;
	}

	ul {
		padding-left: 33px;
		padding-top: 11px;
	}

	li {
		list-style: none;
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		margin-top: 18px;
	}

	li a {
		font-weight: 400;
	}

	.navigation {
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
	}

	.dropdown {
		position: absolute;
		top: 64px;
		left: 0;
		z-index: 2;
		background: var(--background-l0);
		width: 100%;
		border-bottom: 1px solid var(--stroke-secondary);
	}

	@media (min-width: 766.99px) {
		header {
			display: none !important;
		}
	}
</style>
