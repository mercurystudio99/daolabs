<script lang="ts">
	/**
	 * This is the modal that shows right after a project is created.
	 */
	import { getContext } from 'svelte';
	import { constants } from 'ethers';
	import { tweet } from '$utils/v2/tweet';
	import DescriptiveNumberedButton from '$lib/create/DescriptiveNumberedButton.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import Button from '$lib/components/Button.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import { getProjectPlatform } from '$lib/projects/data';
	import IssueErc20 from './IssueERC20.svelte';
	import CreatePayableAddress from './CreatePayableAddress.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	export let close: () => void;
	export let projectId: number;

	let currentSubModal = null;

	const projectURL = `${window.location.origin}/projects/${projectId}`;
	const twitterMsg = `Check out my new @juiceboxETH project! ${projectURL}`;

	enum NextOptions {
		erc20,
		payable,
		twitter,
	}

	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	const done = {
		[NextOptions.erc20]: false,
		[NextOptions.payable]: false,
		[NextOptions.twitter]: false,
	};

	const buttons = [
		...($project.tokenAddress && $project.tokenAddress !== constants.AddressZero
			? []
			: [
					{
						id: NextOptions.erc20,
						title: 'Issue an ERC-20 token',
						description:
							'Create your own ERC-20 token to represent a stake in your treasury. Contributors will receive these tokens when they contribute to your treasury.',
						onClick: () => {
							currentSubModal = bind(IssueErc20, {
								onSuccess: () => {
									done[NextOptions.erc20] = true;
								},
								close: () => {},
							});
						},
					},
			  ]),
		{
			id: NextOptions.payable,
			title: 'Create a payable address',
			description: 'Create an Ethereum address that can be used to pay your treasury directly.',
			onClick: () => {
				currentSubModal = bind(CreatePayableAddress, {
					projectId: $project.projectId,
					platform: getProjectPlatform(project),
					onSuccess: () => {
						done[NextOptions.payable] = true;
					},
					close: () => {},
				});
			},
		},
		{
			id: NextOptions.twitter,
			title: 'Share your Treasury with Twitter',
			description: "Let's get this party started by telling the world!",
			onClick: () => {
				tweet(twitterMsg);
				done[NextOptions.twitter] = true;
			},
		},
	];
</script>

<h2>Treasury Next steps</h2>
<section>
	<p>
		<Trans>
			Congratulations on launching your treasury! We recommend you review and take these next steps
			to help your treasury gain traction. These steps are optional and you can complete them at
			your leisure.
		</Trans>
	</p>
	{#each buttons as button, number}
		<DescriptiveNumberedButton
			{...button}
			number={number + 1}
			visited={done[button.id]}
			disabled={done[button.id]}
		/>
	{/each}

	<div class="right">
		<Button size="md" type="secondary" on:click={close}><Trans>Later</Trans></Button>
	</div>
</section>

<!-- TODO just don't do this, make modals work properly with several modals. Doing this now due to timelimit -->
<Modal show={currentSubModal} />

<style>
	h2 {
		color: var(--text-header);
	}

	p {
		font-weight: 300;
	}

	section {
		max-width: 450px;
	}

	.right {
		float: right;
	}
</style>
