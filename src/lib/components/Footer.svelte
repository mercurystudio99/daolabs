<script lang="ts">
	import { onMount } from 'svelte';
	import EstimateGas from '$lib/components/EstimateGas.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { getCommitHash, type CommitData } from '$lib/utils/getCommitHashData';
	import { darkMode } from '$stores';

	let commitData: CommitData;

	onMount(() => {
		commitData = getCommitHash();
	});
</script>

<footer>
	<div class="wrapper">
		<div class="shoutout">
			<img
				src={$darkMode ? '/images/juice_logo-od.png' : '/images/juice_logo-ol.png'}
				alt="DAOLABS logo"
			/>
			<p>
				<Trans>
					Movement DAO is a platform for enabling community Treasuries and Collections for public
					goods and social impact activities.
				</Trans>
			</p>
		</div>

		<!-- TODO: stack the links on mobile -->
		<div class="links">
			<a href="/about" target="_blank" rel="noreferrer">About</a>
			<a
				href="https://etherscan.io/address/0x143cC0A996De329C1C5723Ee4F15D2a40c1203c6"
				target="_blank"
				rel="noreferrer"
			>
				Gnosis
			</a>
			<a href="/terms-of-service" target="_blank">Terms</a>
			<a href="https://snapshot.org/#/snapshot.movedao.eth" target="_blank" rel="noreferrer"
				>Snapshot</a
			>
			<a
				href="https://app.usefathom.com/share/otvdyquu/daolabs-main"
				target="_blank"
				rel="noreferrer">Fathom</a
			>
			<a href="https://discord.gg/daolabs" target="_blank" rel="noreferrer">Discord</a>
		</div>
		<EstimateGas />

		<!-- TODO: add languages and discord, github, twitter, and privacy policy -->
	</div>
	{#if commitData}
		<div class="versions">
			<span class="text">Version: </span>
			<span>
				<a
					target="_blank"
					rel="noreferrer"
					href={`https://github.com/tankbottoms/juice-interface-svelte/commit/${commitData.hash}`}
				>
					#{commitData.hash}-{commitData.timestamp}
				</a>
			</span>
		</div>
	{/if}
</footer>

<style>
	footer {
		padding: 40px 20px;
		background: var(--background-l1);
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 32px;
	}

	.versions {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20px;
	}
	.text {
		color: var(--primary-text);
		display: block;
		margin-right: 10px;
	}
	p {
		color: var(--primary-text);
		margin: 0;
	}

	.shoutout {
		display: flex;
		margin-bottom: 20px;
		width: 350px;
		align-items: center;
		text-align: left;
	}

	.shoutout img {
		width: 40px;
		height: 40px;
		margin-right: 20px;
	}

	.links {
		display: flex;
		text-align: center;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}
</style>
