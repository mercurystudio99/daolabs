<script lang="ts">
	import { getContext } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Trans from '$lib/components/Trans.svelte';
	// import { darkMode } from '$stores';
	import DiscoBulletin from '$lib/components/DiscoBulletin.svelte';
	// import RubeGoldberg from '$lib/components/RubeGoldberg.svelte';
	import RubeGoldbergDAO from '$lib/components/RubeGoldbergDAO.svelte';
	import RubeGoldbergNFT from '$lib/components/RubeGoldbergNFT.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import { goto } from '$app/navigation';
	import type { I18n } from 'lingui_core/esm';
	import type { Readable } from 'svelte/store';

	const slideOne = [
		'Community. Participate in <a href="https://discord.gg/daolabs">Discord.</a>',
		'Documentation. <a href="https://docs.move.xyz/daolabs/daos/move/proposals/README.md">Review past and future proposals.</a>',
		'Audit. <a href="https://app.safe.global/transactions/history?safe=eth:0x143cC0A996De329C1C5723Ee4F15D2a40c1203c6">All transactions</a> after Snapshot are transparent.',
		'IRL organizational resources. <a href="https://docs.move.xyz/legal/intro/README.md">Legal templates.</a>',
	];

	const slideTwo = [
		'Non-Profit and Social Impact Communities.',
		'For-profit ventures exploring decentralization earnings.',
		'Deploy Membership and subscription Organizations.',
		'Explore other organizational models to match your vision.',
	];

	const slideThree = [
		'Create collections of limited edition multimedia pieces.',
		'Iteratively develop unique, generative artwork with P5.js.',
		'Deploy 10k PFP collection in minutes.',
		'Seamlessly import/export configurations for added flexibility.',
	];

	const slideFour = [
		'Important information placeholder one.',
		'Important information placeholder two.',
		'Important information placeholder three.',
		'Important information placeholder four.',
	];

	const i18n: Readable<I18n> = getContext('i18n');

	const loading = {
		project: false,
		token: false,
	};

	async function goToExplore() {
		loading.token = true;
		await goto('/projects');
	}

	async function goToCreateProject() {
		loading.project = true;
		await goto('/create');
	}

	async function goToCreateCollection() {
		loading.project = true;
		await goto('/user/collections');
	}
</script>

<section>
	<!-- NOTE: add in 4 below when slideFour is populated  -->
	<Carousel items={[1, 2, 3]} let:index>
		{#if index === 0}
			<div class="slide">
				<article>
					<h1><Trans message="Start a Movement" /></h1>
					<h1><Trans message="Change the World" /></h1>
					<div class="description-wrapper">
						<p class="blurb">
							{$i18n._(
								'Movement DAO leverages Ethereum to enable community Treasuries - instantly form, capitalize and govern with Ethereum, ERC-20 and ERC-721 assets. \
							Collections are powerful content creation tools which enable Treasuries to create products. Treasuries and Collections together are Movements. \
							Movement DAO and its affiliate DAOLABS, LLC are governed by the Movement community through ',
							)}
							<a href="https://snapshot.org/#/snapshot.movedao.eth" target="noreferrer"
								>{$i18n._('Snapshot.')}</a
							>
							{$i18n._(" Movement DAO's mission is to enable communities.")}
						</p>
						<h5 class="sub-header">Learn more:</h5>
						{#each slideOne as item}
							<div class="item">
								<div class="bulletin">
									<DiscoBulletin />
								</div>
								<p>
									{@html item}
								</p>
							</div>
						{/each}
					</div>

					<div class="button-wrapper">
						<div class="linkButton">
							<Button fullWidth loading={loading.project} on:click={goToCreateProject}>
								Create a Treasury
							</Button>
						</div>
						<div class="linkButton">
							<Button type="secondary" fullWidth loading={loading.token} on:click={goToExplore}>
								Explore Treasuries
							</Button>
						</div>
					</div>
				</article>

				<div id="goldberg">
					<RubeGoldbergDAO />
				</div>
			</div>
		{:else if index === 1}
			<div class="slide">
				<article>
					<h1><Trans message="What is a DAO?" /></h1>
					<div class="description-wrapper">
						<p class="blurb">
							{$i18n._(
								"Decentralized Autonomous Organizations are associations which form when individuals agree to a shared Ethereum wallet and how decisions are made. \
							While organization structures, governance and tools vary, they are not needed, at its most fundamental level, those who operate the Ethereum addresses control the Ethereum. \
							Communities may choose to employ code-is-law, subjective verbal agreements, risk revisionist history or explicit agreements to document the community's understanding with its members. \
							Treasuries require explicit designation of their for-profit or non-profit charter, a membership NFT and the creators agreement to act responsible.",
							)}
						</p>
						<h5 class="sub-header">Learn more:</h5>
						{#each slideTwo as item}
							<div class="item">
								<div class="bulletin">
									<DiscoBulletin />
								</div>
								<p>
									<Trans>
										{@html item}
									</Trans>
								</p>
							</div>
						{/each}
					</div>

					<div class="button-wrapper">
						<div class="linkButton">
							<Button fullWidth loading={loading.project} on:click={goToCreateProject}>
								Create a Treasury
							</Button>
						</div>
						<div class="linkButton">
							<Button type="secondary" fullWidth loading={loading.token} on:click={goToExplore}>
								Explore Treasuries
							</Button>
						</div>
					</div>
				</article>
				<div id="goldberg">
					<RubeGoldbergDAO />
				</div>
			</div>
		{:else if index === 2}
			<div class="slide">
				<article>
					<h1><Trans message="NFT Collections" /></h1>
					<div class="description-wrapper">
						<p class="blurb">
							{$i18n._(
								'NFTs, Non-fungible Tokens certify the uniqueness, ownership, and value of digital objects. \
							Our no-code NFT Creation tools remove the barriers to creating and generating substantial value through digital objects on Ethereum. \
							While you get busy crafting, we handle the rest. ',
							)}
						</p>
						<h5 class="sub-header">With us, you can:</h5>
						{#each slideThree as item}
							<div class="item">
								<div class="bulletin">
									<DiscoBulletin />
								</div>
								<p>
									<Trans>
										{@html item}
									</Trans>
								</p>
							</div>
						{/each}
					</div>

					<div class="button-wrapper">
						<div class="linkButton">
							<Button fullWidth loading={loading.project} on:click={goToCreateCollection}>
								Create a Collection
							</Button>
						</div>
						<div class="linkButton">
							<Button type="secondary" fullWidth loading={loading.token} on:click={goToExplore}>
								Explore Collections
							</Button>
						</div>
					</div>
				</article>
				<div id="goldberg">
					<RubeGoldbergNFT />
				</div>
			</div>
		{:else if index === 3}
			<div class="slide">
				<article>
					<h1><Trans message="Placeholder Slide" /></h1>
					<div class="description-wrapper">
						<p class="blurb">
							{$i18n._(
								'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
							)}
						</p>
						<h5 class="sub-header">Learn more:</h5>
						{#each slideFour as item}
							<div class="item">
								<div class="bulletin">
									<DiscoBulletin />
								</div>
								<p>
									<Trans>
										{@html item}
									</Trans>
								</p>
							</div>
						{/each}
					</div>

					<div class="button-wrapper">
						<div class="linkButton">
							<Button fullWidth loading={loading.project} on:click={goToCreateProject}>
								Placeholder Button
							</Button>
						</div>
						<div class="linkButton">
							<Button type="secondary" fullWidth loading={loading.token} on:click={goToExplore}>
								Placeholder Button
							</Button>
						</div>
					</div>
				</article>
				<div id="goldberg">
					<RubeGoldbergNFT />
				</div>
			</div>
		{/if}
	</Carousel>
</section>

<style>
	h1 {
		color: var(--accent);
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin-top: 0px;
		margin-bottom: 0px;
		font-family: Monoton;
		font-size: 38px;
		font-weight: 400;
		line-height: 46px;
		letter-spacing: 0.06em;
		text-align: left;
	}
	section {
		position: relative;
		max-width: 1280px;
		margin: 40px auto 20px;
		/* The header height */
		margin-top: 68px;
		padding: 0px 20px;
	}
	section .slide {
		max-width: 1080px;
		display: flex;
		align-items: center;
		flex-flow: row wrap;
		justify-content: center;
		padding: 0px 40px;
		margin: 0px auto;
	}
	article {
		flex: 0 0 50%;
		max-width: 50%;
		display: flex;
		flex-direction: column;
		gap: 24px;
		flex-grow: 1;
	}
	.bulletin {
		height: 24px;
	}
	.button-wrapper {
		display: flex;
		gap: 28px;
	}
	.linkButton {
		display: inline-block;
		width: fit-content;
	}
	p {
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.57;
	}
	#goldberg {
		min-height: 300px;
		object-fit: contain;
		display: block;
		flex: 0 0 50%;
		max-width: 50%;
		width: 100%;
	}
	.blurb {
		font-size: 16px;
		color: var(--text-secondary);
		font-weight: 400;
		line-height: 25px;
		letter-spacing: -0.002em;
		text-align: left;
	}
	.sub-header {
		color: var(--text-header);
		font-size: 16px;
		font-weight: 700;
		line-height: 25px;
	}
	.item {
		display: flex;
		align-items: center;
		margin: 6px 0px;
	}
	.item p {
		font-weight: 400;
		font-size: 14px;
		margin: 0.2em;
		margin-left: 12px;
		letter-spacing: 1px;
	}
	@media (max-width: 850px) {
		article {
			flex: 0 0 100%;
			max-width: 100%;
		}
		.linkButton {
			display: block;
			margin-top: 2em;
			width: 100%;
		}
		h1 {
			font-size: 3rem;
		}
		#goldberg {
			min-width: 300px;
			transform: translateX(30px);
			display: none;
		}
	}

	@media (max-width: 600px) {
		h1 {
			font-size: 2.2rem;
		}
		section .slide {
			padding: 0px 25px;
		}
	}
</style>
