<script lang="ts">
	import { isAddress } from 'ethers/lib/utils';
	import { createEventDispatcher } from 'svelte';
	import clickOutsideDirective from '$utils/clickOutside';
	import { calculateTotalPercent, type Recipient } from '$models/payout-recipients';
	import Button from '../Button.svelte';
	import CloseButton from '../CloseButton.svelte';
	import EnsOrAddress from '../EnsOrAddress.svelte';
	import FormError from '../minter/form/FormError.svelte';
	import PopInfo from '../PopInfo.svelte';
	import Modal, { bind, type ModalType } from '../Modal.svelte';
	import PayoutReceiverModal from '../PayoutReceiverModal.svelte';

	export let label: string;
	export let info: string = '';
	export let mandatory: boolean = false;
	export let review: boolean = false;

	export let recipients: Recipient[];
	export let error: string = '';

	let selected: number;
	let modal: ModalType;
	const dispatch = createEventDispatcher();

	const triggerChangeEvent = () => {
		dispatch('change', [...recipients]);
	};

	const handleAddReceiver = () => {
		modal = bind(PayoutReceiverModal, {
			recipients,
			saveReceiver: (r: Recipient) => {
				recipients.push(r);
				triggerChangeEvent();
			},
			close: () => {},
		});
	};

	const handleRecipientEdit = (index: number) => () => {
		const openRecipientForEdit = () => {
			modal = bind(PayoutReceiverModal, {
				recipients,
				editIndex: index,
				saveReceiver: (r: Recipient) => {
					recipients[index] = r;
					triggerChangeEvent();
				},
				close: () => {},
			});
		};

		if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
			if (selected === index) {
				openRecipientForEdit();
				selected = null;
			} else {
				selected = index;
			}
		} else {
			openRecipientForEdit();
		}
	};

	const handleRecipientDelete = (index: number) => (event: MouseEvent) => {
		event.stopPropagation();
		recipients.splice(index, 1);
		triggerChangeEvent();
	};

	$: total = calculateTotalPercent(recipients);
</script>

<div class="main">
	{#if label}
		<h4>
			<PopInfo message={info}>
				{label}{#if mandatory}<small>*</small>{/if}
			</PopInfo>
		</h4>
	{/if}
	{#if (recipients && recipients.length > 0) || error}
		<div class="receivers" use:clickOutsideDirective on:clickOutside={() => (selected = null)}>
			{#if recipients && recipients.length > 0}
				{#each recipients as recipient, index}
					<div
						class="recipient"
						class:review
						class:selected={!review && selected === index}
						on:click={review ? () => {} : handleRecipientEdit(index)}
						on:keydown
					>
						<span>
							{#if isAddress(recipient.address)}
								<EnsOrAddress address={recipient.address} />
							{:else}
								{recipient.name}
							{/if}
						</span>
						<span>{recipient.percent}%</span>
						<div class="delete">
							<CloseButton
								size="8px"
								position="0"
								color="--text-action-primary"
								on:click={handleRecipientDelete(index)}
							/>
						</div>
					</div>
				{/each}
			{/if}
			{#if error}
				<FormError {error} />
			{/if}
		</div>
	{/if}
	{#if !review}
		<Button
			size="md"
			buttonProps={{ type: 'button' }}
			type="tertiary"
			on:click={handleAddReceiver}
			disabled={total === 100}
		>
			Add receiver
		</Button>
	{/if}
</div>
<Modal
	show={modal}
	on:close={() => (modal = undefined)}
	styleInnerContent={{ overflow: 'visible' }}
/>

<style lang="scss">
	.main {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	h4 {
		color: var(--text-header);
		display: flex;
		margin-bottom: 0px;
	}

	.receivers {
		padding: 8px 16px;
		border: 0.4px solid var(--stroke-tertiary);
		display: flex;
		flex-direction: column;
		gap: 4px;

		.selected {
			border: 0.4px dashed var(--stroke-action-primary);
		}

		.recipient {
			position: relative;
			display: flex;
			justify-content: space-between;
			cursor: pointer;

			span {
				color: var(--text-secondary);
			}

			&:hover {
				padding-right: 16px;
				.delete {
					display: block;
				}
			}

			.delete {
				position: absolute;
				right: 0;
				top: 0;
				display: none;
			}

			@media (hover: none) {
				&:hover {
					padding-right: 0px;
					.delete {
						position: absolute;
						right: 0;
						top: 0;
						display: none;
					}
				}
			}
		}

		.recipient.selected {
			padding-right: 16px;
			.delete {
				display: block;
			}
		}

		.review {
			cursor: default;
			&:hover {
				padding-right: 0px;
				.delete {
					display: none;
				}
			}
		}
	}
</style>
