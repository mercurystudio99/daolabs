<script lang="ts">
	import InfoBox from '$lib/components/InfoBox.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import DescriptiveNumberedButton from '../DescriptiveNumberedButton.svelte';
	import RulesDrawer from '../RulesDrawer.svelte';
	import ExtensionsDrawer from '../ExtensionsDrawer.svelte';
	import { visitedFundingDrawers as visited } from '../stores';
	import LegalDrawer from '../LegalDrawer.svelte';
	import FundingDrawer from './FundingDrawer.svelte';
	import TokenDrawer from './TokenDrawer';

	let drawerOpen = false;
	let current = '';

	const buttons = [
		{
			title: 'Funding',
			id: 'funding-button',
			description: 'Configure how your treasury will collect and spend funds.',
		},
		{
			title: 'Token',
			id: 'token',
			description: "Configure the issuing dynamics of your treasury's token.",
		},
		{
			title: 'Membership',
			id: 'extensions',
			description: `Configure your treasury's membership non-fungible token.`,
		},
		{
			title: 'Rules',
			id: 'rules',
			description: 'Configure treasury restrictions using cycle durations.',
		},
		{
			title: 'Document templates',
			id: 'legal',
			description: 'Configure documents for your treasury.',
		},
	];

	function onClick(button: string) {
		drawerOpen = true;
		current = button;
		visited.update(
			(state: { funding: boolean; token: boolean; rules: boolean; extensions: boolean }) => ({
				...state,
				[button]: true,
			}),
		);
	}
</script>

<InfoBox
	info={`Reconfiguration Strategies are how you convey trust to the community by setting rules on how quickly your treasury may be reconfigured. The configs below can be edited on a per-cycle basis. <br><br> Funding Cycle #1 will start immediately after you deploy your project. Once deployed, <b>Funding Cycle #1 can't be reconfigured.</b>
<br><br>
You can reconfigure your project's next funding cycle (Funding Cycle #2) at any time within the bounds of the rules set below.
`}
/>
<br />

<section class="buttons">
	{#each buttons as button, number}
		<span id={button.id}>
			<DescriptiveNumberedButton
				{...button}
				number={number + 1}
				onClick={() => onClick(button.title)}
				visited={$visited[button.title]}
			/>
		</span>
	{/each}
</section>

<Drawer bind:shown={drawerOpen} let:close>
	<div class="content">
		{#if current === 'Funding'}
			<FundingDrawer {close}>
				<h1 slot="header">Use of Funds</h1>
			</FundingDrawer>
		{:else if current === 'Token'}
			<TokenDrawer {close}>
				<header slot="header">
					<h1>Treasury tokenomics</h1>
					<h4 style="font-weight: 300;">
						Configure your project's tokenomics such as how many to issue, how many are reserved,
						what type of discounts are applied, and what the redemption rates are such the funding
						economics are fair for your specific treasury case.
					</h4>
					<br />
				</header>
			</TokenDrawer>
		{:else if current === 'Rules'}
			<RulesDrawer {close}>
				<h1 slot="header">Rules</h1>
			</RulesDrawer>
		{:else if current === 'Membership'}
			<ExtensionsDrawer {close}>
				<h1 slot="header">Membership</h1>
			</ExtensionsDrawer>
		{:else if current === 'Document templates'}
			<LegalDrawer {close}>
				<h1 slot="header">Document Templates</h1>
			</LegalDrawer>
		{/if}
	</div>
</Drawer>

<style>
	h1 {
		font-weight: 500;
		color: var(--text-header);
	}
	.buttons {
		margin-top: 40px;
	}

	.content {
		padding: 24px;
		font-size: 14px;
		line-height: 1.5715;
		word-wrap: break-word;
	}
</style>
