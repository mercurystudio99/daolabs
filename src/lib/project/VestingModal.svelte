<script lang="ts">
	import { constants } from 'ethers';
	import { getContext } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Input from '$lib/components/Input.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { PeriodType, type Vest } from '$models/v2/vests';
	import { tokenSymbolText } from '$utils/tokenSymbolText';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';
	/*
	TODO: Tooltip text
	*/
	export let close: () => void;
	export let addVest: (vest) => void;

	const projectContext: Store<V2ProjectContextType> = getContext('PROJECT');
	const { tokenSymbol } = $projectContext;

	const tokenText = tokenSymbolText({
		tokenSymbol,
		capitalize: true,
		plural: false,
	});

	const vest: Vest = {
		recipient: '',
		token: '',
		tokenAmount: '',
		vestingPeriod: {
			value: '',
			type: PeriodType.MONTHS,
		},
		cliff: {
			value: '',
			type: PeriodType.MONTHS,
		},
		description: '',
	};
	let agreement = false;

	const createVest = () => {
		if (agreement && vest.token && vest.recipient) {
			addVest(vest);
			close();
		}
	};
</script>

<form on:submit|preventDefault={createVest}>
	<section>
		<h2><Trans>Vesting</Trans></h2>
		<p><Trans>Create vesting for core community members.</Trans></p>
		<div class="input">
			<label for="recipient">
				<PopInfo message="Recipient tooltip text">
					<Trans>Recipient</Trans>
				</PopInfo>
			</label>
			<Input
				required={true}
				id="recipient"
				type="address"
				placeholder={constants.AddressZero}
				bind:value={vest.recipient}
			/>
			<p><Trans>Address you are creating the vest for. This can be your own address</Trans></p>
		</div>
		<div class="input">
			<label for="">
				<PopInfo message="Token tooltip text">
					<Trans>Token</Trans>
				</PopInfo>
			</label>
			<Dropdown
				options={[{ label: tokenText, value: tokenText }]}
				placeholder="Token"
				bind:value={vest.token}
			/>
			<p><Trans>Select a token you own in your wallet</Trans></p>
		</div>
		<div class="input">
			<label for="tokens">
				<PopInfo message="Number of tokens tooltip text">
					<Trans>Number of tokens</Trans>
				</PopInfo>
			</label>
			<Input
				required={true}
				type="number"
				id="tokens"
				placeholder="999 999"
				bind:value={vest.tokenAmount}
			/>
			<p><Trans>Total amount of tokens you'd like to vest</Trans></p>
		</div>
		<div class="double-input">
			<div class="input">
				<label for="period">
					<PopInfo message="Period tooltip text">
						<Trans>Vesting period</Trans>
					</PopInfo>
				</label>
				<div class="period-input">
					<div class="input">
						<Input
							id="period"
							type="number"
							required={true}
							placeholder="6"
							bind:value={vest.vestingPeriod.value}
						/>
					</div>
					<div class="dropdown">
						<Dropdown
							options={[
								{ label: PeriodType.MONTHS, value: PeriodType.MONTHS },
								{ label: PeriodType.YEARS, value: PeriodType.YEARS },
							]}
							bind:value={vest.vestingPeriod.type}
						/>
					</div>
				</div>
				<p><Trans>Total time period for the vest</Trans></p>
			</div>
			<div class="input">
				<label for="cliff">
					<PopInfo message="Cliff tooltip text">
						<Trans>Cliff</Trans>
					</PopInfo>
				</label>
				<div class="period-input">
					<div class="input">
						<Input id="cliff" type="number" placeholder="10" bind:value={vest.cliff.value} />
					</div>
					<div class="dropdown">
						<Dropdown
							options={[
								{ label: PeriodType.MONTHS, value: PeriodType.MONTHS },
								{ label: PeriodType.YEARS, value: PeriodType.YEARS },
							]}
							bind:value={vest.cliff.type}
						/>
					</div>
				</div>
				<p><Trans>Minimum time period before the first vest is unlocked</Trans></p>
			</div>
		</div>
		<div class="input">
			<label for="description">
				<PopInfo message="Description tooltip text">
					<Trans>Description</Trans>
				</PopInfo>
			</label>
			<textarea
				id="description"
				placeholder="A brief description about your vest"
				bind:value={vest.description}
			/>
		</div>
		<div class="agreement">
			<input type="checkbox" bind:checked={agreement} id="agreement" class="checkbox" />
			<Trans>
				I understand that these values can't be changed after deployment and I hereby accept the
				Token Agreement
			</Trans>
		</div>
		<Button size="md" type={agreement ? 'primary' : 'tertiary'}>
			<Trans>Deposit</Trans>
		</Button>
	</section>
</form>

<style lang="scss">
	section {
		padding: 0 8px;
		max-width: 550px;
		display: flex;
		flex-direction: column;
		gap: 16px;

		h2 {
			color: var(--text-header);
			margin: 0;
		}
		p {
			color: var(--text-secondary);
			margin: 0;
		}
		.input {
			display: flex;
			flex-direction: column;
			label {
				color: var(--text-header);
				margin-bottom: 8px;
			}
			p {
				margin-top: 8px;
				color: var(--text-secondary);
			}
			textarea {
				flex-grow: 1;
				margin: 0;
				font-variant: tabular-nums;
				font-family: inherit;
				font-size: 14px;
				font-weight: 300;
				list-style: none;
				-webkit-font-feature-settings: 'tnum', 'tnum';
				font-feature-settings: 'tnum', 'tnum';
				position: relative;
				display: inline-block;
				min-width: 0;
				padding: 4px 11px;
				color: var(--text-primary);
				line-height: 1.5715;
				background-color: transparent;
				border: 1px solid var(--stroke-primary);
				transition: all 0.3s;
				width: 100%;
			}
		}
		.double-input {
			display: flex;
			gap: 8px;
			justify-content: space-between;

			.input {
				flex-basis: 45%;
			}

			.period-input {
				display: flex;
				gap: 8px;
				.input {
					flex-grow: 1;
				}
			}
			.dropdown {
				flex-basis: 45%;
			}
		}

		.agreement {
			display: flex;
			align-items: center;
			.checkbox {
				appearance: none;
				cursor: pointer;
				margin-right: 8px;
				min-width: 15px;
				height: 15px;
				border: 1px solid var(--stroke-action-primary);
				border-radius: 2px;
				background-color: var(--background-l0);
				display: grid;
				place-content: center;
				&::before {
					content: '';
					width: 9px;
					height: 9px;
					box-shadow: inset 20px 20px var(--background-l0);
					clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
				}
				&:checked::before {
					transform: scale(1);
					transform: rotate(10deg);
				}
				&:checked {
					background-color: var(--icon-action-primary);
				}
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 550px) {
		section {
			.double-input {
				flex-direction: column;
			}
		}
	}
</style>
