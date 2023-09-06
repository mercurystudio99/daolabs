<script lang="ts">
	import PopInfo from '$lib/components/PopInfo.svelte';
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import PricingChooseProject from '$lib/components/pricing/PricingChooseProject.svelte';

	// Export variables
	export let service;
	export let services;

	// Local variables and constants
	let formModal;

	// Functions
	function handleSelectService(serviceName: string) {
		services = [...services.slice(0, 3), { label: serviceName, value: serviceName }];
		service = serviceName;
	}

	function handleSelect({ detail: { value } }) {
		if (value === 'jb') {
			formModal = bind(PricingChooseProject, { handleSelectService });
		}
	}
</script>

<div class="revenue-block">
	<h4>
		<PopInfo message="Tooltip text">Fees</PopInfo>
	</h4>
	<div class="revenue">
		<span>
			<PopInfo message="Tooltip text">
				<div class="left">Service fee:</div>
			</PopInfo>
			<div class="right">
				<HoverDropdown
					size="sm"
					options={services}
					bind:value={service}
					style="width: auto;"
					initial="juicebox"
					on:select={handleSelect}
				/>
				<div>1%</div>
			</div>
		</span>
		<span>
			<PopInfo message="Tooltip text">
				<div class="left">Royalty rate:</div>
			</PopInfo>
			<div class="right">
				<div>10%</div>
			</div>
		</span>
	</div>
</div>

<Modal
	on:close={() => {
		formModal = undefined;
	}}
	show={formModal}
/>

<style lang="scss">
	.revenue-block {
		display: flex;
		flex-direction: column;
		color: var(--text-secondary);
		margin-bottom: 16px;
		margin-top: 16px;
		h4 {
			color: var(--text-header);
			margin-bottom: 8px;
		}

		.revenue {
			padding: 8px;
			border: 0.4px solid var(--stroke-tertiary);
			display: flex;
			flex-direction: column;
			gap: 4px;

			span {
				display: flex;
				width: 100%;
				justify-content: space-between;
				gap: 10px;

				.right {
					display: flex;
					flex-wrap: wrap;
					gap: 4px;
					justify-content: flex-end;
				}
				.left {
					width: auto;
				}
			}
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		.revenue-block {
			.revenue {
				span {
					.left {
						width: min-content;
					}
				}
			}
		}
	}
</style>
