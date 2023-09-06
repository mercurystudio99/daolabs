<script lang="ts">
	import { constants } from 'ethers';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import QrCode from '$lib/components/QRCode.svelte';
	import { capitalize } from '$utils/string';
	import Popover from '$lib/components/Popover.svelte';
	import Icon from '$lib/components/Icon';
	import type { DeployETHERC20ProjectPayerEvent } from '$models/subgraph-entities/v2/deploy-eth-erc20-project-payer-event';

	export let event: Partial<DeployETHERC20ProjectPayerEvent>;
</script>

<section>
	<QrCode value={event?.address} />
	<div class="info">
		<div class="extra">
			<slot name="extra" />
		</div>
		<InfoSpaceBetween>
			<p slot="left"><b>Mints tokens: </b></p>
			<p slot="right">
				{capitalize(event?.preferAddToBalance.toString())}
				<Popover message="Tokens will be minted as a result of contributing to this project.">
					<Icon name="questionCircle" />
				</Popover>
			</p>
		</InfoSpaceBetween>

		<InfoSpaceBetween>
			<p slot="left"><b>Token beneficiary: </b></p>
			<p slot="right">
				{#if event.beneficiary === constants.AddressZero || !event.beneficiary}
					Default <Popover
						message="Treasury tokens will be minted to whoever contributes to this payer contract (address)."
					>
						<Icon name="questionCircle" />
					</Popover>
				{:else}
					<EnsOrAddress address={event.beneficiary} />
					<Popover
						message="When someone pays this payer contract (address), Treasury tokens will always be minted to this
                    address,
                    <strong>not to the person who paid.</strong>"
					>
						<Icon name="questionCircle" />
					</Popover>
				{/if}
			</p>
		</InfoSpaceBetween>

		{#if event.preferClaimedTokens}
			<InfoSpaceBetween>
				<p slot="left"><b>Mints tokens as ERC-20: </b></p>
				<p slot="right">
					{capitalize(event?.preferClaimedTokens.toString())}
					<Popover
						message="New project tokens are automatically minted as ERC-20's. The gas to pay this contract will be higher than normal."
					>
						<Icon name="questionCircle" />
					</Popover>
				</p>
			</InfoSpaceBetween>
		{/if}
	</div>
</section>

<style>
	section {
		display: flex;
	}

	.extra {
		color: var(--text-tertiary);
	}

	.info {
		flex: 1;
		margin-left: 16px;
		margin-right: 16px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 650px) {
		section {
			flex-direction: column;
		}
	}
</style>
