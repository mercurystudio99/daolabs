<script lang="ts">
	import { BigNumber } from 'ethers';
	import { onMount } from 'svelte';
	import DescriptiveNumberedButton from '$lib/create/DescriptiveNumberedButton.svelte';
	import { ownerOf } from '$utils/web3/JBProjects';
	import { getContractPlatform } from '$lib/projects/data';
	import { ZeroAddress } from '$constants';
	import type { ProjectPlatform } from '$constants/platform';

	export let close = () => {};
	export let id: number;
	export let name: string;
	export let projectPlatform: ProjectPlatform;
	export let useAddress: (address?: string) => void;

	let owner: string;
	let options: { title: string; description: string; onClick: () => void }[];

	const buildOptions = (address: string, projectName: string) => {
		return [
			{
				title: "Use project's owner address",
				description: `${address} address will be used as payable address`,
				onClick: () => {
					useAddress(address);
					close();
				},
			},
			{
				title: 'Create payable address',
				description: `You will be redirected to ${projectName} page to create payble address`,
				onClick: () => {
					useAddress(ZeroAddress);
					close();
				},
			},
		];
	};

	onMount(() => {
		ownerOf(getContractPlatform(projectPlatform), BigNumber.from(id))
			.then((address) => (owner = address))
			.catch((err) => console.log(err));
	});

	$: options = buildOptions(owner, name);
</script>

<main class:expanded={false}>
	<h2>Payable Address</h2>
	<p>
		We could not define the payable address of <strong>{name}</strong> project. Please select one of
		the following options.
	</p>

	<div class="buttons">
		{#each options as option, number}
			<DescriptiveNumberedButton {...option} number={number + 1} visited={false} disabled={false} />
		{/each}
	</div>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		padding: 8px;
		max-width: 558px;
	}

	.expanded {
		max-width: 1116px;
	}
	h2 {
		color: var(--text-header);
	}
	p {
		font-weight: 300;
	}

	.buttons {
		display: flex;
		gap: 8px;
		flex-direction: column;
	}
</style>
