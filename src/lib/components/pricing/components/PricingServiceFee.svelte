<script lang="ts">
	import PopInfo from '$lib/components/PopInfo.svelte';
	import HoverDropdown from '$lib/components/HoverDropdown.svelte';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import PricingChooseProject from '../PricingChooseProject.svelte';

	// Export variables
	export let service: string;
	export let serviceFee: number;
	export let currency: string;
	export let review: boolean = false;

	const defaultService = 'juicebox';
	const initialValue = service ?? defaultService;
	let formModal;
	let services = [
		{
			label: 'Juicebox',
			value: defaultService,
		},
		{
			label: 'Choose a Juicebox project',
			value: 'jb',
		},
	];

	const getServices = (savedService: string) => {
		if (savedService && services.findIndex((s) => s.value === savedService) === -1) {
			return [...services.slice(0, 2), { label: savedService, value: savedService }];
		}

		return services;
	};

	const handleProjectSelect = (project: string) => {
		service = project;
	};

	const handleDropdownSelect = ({ detail: { value } }) => {
		if (value === 'jb') {
			formModal = bind(PricingChooseProject, {
				handleSelectService: handleProjectSelect,
				close: () => {},
			});
			service = defaultService;
		}
	};

	$: services = getServices(service);
</script>

<div class="revenue-block">
	<h4>
		<PopInfo message="Tooltip text">Service fee</PopInfo>
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
					initial={initialValue}
					on:select={handleDropdownSelect}
					{review}
				/>
				<div>
					{serviceFee}
					{currency}
				</div>
			</div>
		</span>
	</div>
</div>

<Modal
	on:close={(e) => {
		e.preventDefault();
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

		h4 {
			color: var(--text-header);
			margin-bottom: 8px;
		}

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
				align-items: center;
			}
			.left {
				width: auto;
			}
		}

		.revenue {
			padding: 8px;
			border: 0.4px solid var(--stroke-tertiary);
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 400px) {
		.revenue-block {
			span {
				.left {
					width: min-content;
				}
			}
		}
	}
</style>
