<script lang="ts">
	import Button from '../Button.svelte';
	import Checkbox from '../Checkbox.svelte';
	import FormField from '../FormField.svelte';
	import HeavyBorderBox from '../HeavyBorderBox.svelte';
	import InfoBox from '../InfoBox.svelte';

	$: currentStep = 1;
	$: boltCheckout = false;
	$: isSameAdress = true;
	$: showOrderSummary = true;

	const next = () => {
		currentStep += 1;
	};
	const back = () => (currentStep -= 1);
	const pay = () => alert('pay');
	const formFileds = [
		{
			id: 'first-name',
			label: 'First Name',
			placeholder: 'FirstName',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'last-name',
			label: 'Last Name',
			placeholder: 'LastName',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'email',
			label: 'Email Address',
			placeholder: 'email.address@gmail.com',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'phone-number',
			label: 'Phone number',
			placeholder: 'Phone number',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'company-name',
			label: 'Company name (optional)',
			placeholder: 'CompanyName',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'street-address',
			label: 'Street address',
			placeholder: 'Address',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'apartment',
			label: 'Apartment, building, floor (optional)',
			placeholder: 'Address',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'country',
			label: 'Country',
			placeholder: 'United States',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
	];
	const formFiledsSameAddress = [
		{
			id: 'first-name',
			label: 'First Name',
			placeholder: 'FirstName',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'last-name',
			label: 'Last Name',
			placeholder: 'LastName',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'company-name',
			label: 'Company name (optional)',
			placeholder: 'CompanyName',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'street-address',
			label: 'Street address',
			placeholder: 'Address',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'apartment',
			label: 'Apartment, building, floor (optional)',
			placeholder: 'Address',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
		{
			id: 'country',
			label: 'Country',
			placeholder: 'United States',
			type: 'input',
			labelProps: {
				style: 'color: var(--text-header);',
			},
		},
	];
	const formFieldZIP = {
		id: 'zip',
		label: 'ZIP',
		placeholder: 'ZIP',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};
	const formFieldCity = {
		id: 'city',
		label: 'City',
		placeholder: 'Miami',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};
	const formFieldState = {
		id: 'state',
		label: 'State',
		type: 'dropdown',
		options: [{ value: 'FL', label: 'FL' }],
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};

	const formFiledCardNumber = {
		id: 'card-number',
		label: 'Card Number',
		placeholder: '0000 0000 0000 0000',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};

	const formFiledExp = {
		id: 'expiration',
		label: 'Expiration',
		placeholder: '00/0000',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};

	const formFieldCvv = {
		id: 'cvv',
		label: 'CVV',
		placeholder: 'CVV',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};

	const formFiledPay = {
		id: 'amount-of-money',
		label: 'Amount of money',
		placeholder: '3,000',
		type: 'input',
		labelProps: {
			style: 'color: var(--text-header);',
		},
	};

	const orderSummury = [
		{
			value: 'JB',
			label: 'Project name:',
		},
		{
			value: '10,000,000',
			label: 'Quantity:',
			line: 'line',
		},
		{
			value: '$3.000',
			label: 'Subtotal',
		},
		{
			value: '$0.00',
			label: 'Taxes',
			line: 'line',
		},
		{
			value: '$3.000',
			label: 'Total',
		},
	];

	const formFiledBoltCheckout = {
		id: 'bolt-checkout',
		label: '',
		placeholder: `Easy real-time tracking updates in select stores
Bank-level security & account protection
Shop hundreds of stores with Bolt's passwordless login
    `,
		type: 'textarea',
		props: {
			rows: 4,
		},
	};
</script>

<HeavyBorderBox>
	{#if currentStep === 1}
		<span class="card-title">Connect Credit Card</span>
		<form>
			{#each formFileds as formField}
				<FormField field={formField} />
			{/each}
			<div class="form-row">
				<div class="form-row-col">
					<FormField field={formFieldZIP} />
				</div>
				<div class="form-row-col">
					<FormField field={formFieldCity} />
				</div>
				<div class="form-row-col">
					<FormField field={formFieldState} />
				</div>
			</div>
		</form>
		<div class="button-container">
			<Button type="secondary" buttonProps={{ style: 'margin-right: 20px;' }}>Discard</Button>
			<Button on:click={next}>Continue</Button>
		</div>
	{:else if currentStep === 2}
		<span class="card-title">Connect Credit Card</span>
		<form>
			<FormField field={formFiledCardNumber} />
			<div class="form-row">
				<div class="form-row-col-50">
					<FormField field={formFiledExp} />
				</div>
				<div class="form-row-col-50">
					<FormField field={formFieldCvv} />
				</div>
			</div>
			<div class="checkbox-container">
				<label for="address-is-same">Billing Address is the same</label>
				<Checkbox bind:checked={isSameAdress} id="address-is-same" />
			</div>
			<div class="checkbox-container">
				<label for="bolt">Save my information with Bolt for a faster checkout</label>
				<Checkbox bind:checked={boltCheckout} id="bolt" />
			</div>
		</form>
		{#if !isSameAdress}
			<form class="same-address">
				{#each formFiledsSameAddress as formField}
					<FormField field={formField} />
				{/each}
				<div class="form-row">
					<div class="form-row-col">
						<FormField field={formFieldZIP} />
					</div>
					<div class="form-row-col">
						<FormField field={formFieldCity} />
					</div>
					<div class="form-row-col">
						<FormField field={formFieldState} />
					</div>
				</div>
			</form>
		{/if}
		{#if boltCheckout}
			<form>
				<FormField field={formFiledBoltCheckout} />
			</form>
		{/if}
		<div class="button-container">
			<Button on:click={back} type="secondary" buttonProps={{ style: 'margin-right: 20px;' }}
				>Back</Button
			>
			<Button on:click={next}>Continue</Button>
		</div>
		<div class="info-container">
			<InfoBox
				style="background-color: transparent;"
				info="Checkout is powered by Bolt. By clicking Pay you agree to Bolt’s <a href='#'>Terms of Use</a> and <a href='#'>Privacy Policy</a>."
			/>
		</div>
	{:else if currentStep === 3}
		<span class="card-title">Payment details</span>
		<form>
			<FormField field={formFiledPay} />
		</form>
		<div class="checkbox-container">
			<label for="order-summury">Order summury</label>
			<Checkbox bind:checked={showOrderSummary} id="order-summury" />
		</div>
		{#if showOrderSummary}
			<div class="order">
				{#each orderSummury as order}
					<div class={`row ${order.line}`}>
						<div class="column">{order.label}</div>
						<div class="column">{order.value}</div>
					</div>
				{/each}
			</div>
		{/if}
		<div class="button-container">
			<Button on:click={back} type="secondary" buttonProps={{ style: 'margin-right: 20px;' }}
				>Back</Button
			>
			<Button on:click={pay}>Pay</Button>
		</div>
		<div class="info-container">
			<InfoBox
				style="background-color: transparent;"
				info="Checkout is powered by Bolt. By clicking Pay you agree to Bolt’s <a href='#'>Terms of Use</a> and <a href='#'>Privacy Policy</a>."
			/>
		</div>
	{/if}
</HeavyBorderBox>

<style lang="scss">
	.same-address {
		border: 1px solid var(--stroke-tertiary);
		border-radius: 10px;
		margin-top: 15px;
		padding: 0 15px;
		padding-bottom: 15px;
	}
	.order {
		border: 1px solid var(--stroke-tertiary);
		border-radius: 10px;
		margin-top: 15px;
		padding: 10px;
		color: var(--text-header);
		.row {
			display: flex;
			padding: 5px;
			.column {
				flex-basis: 30%;
			}
		}
		.line {
			border-bottom: 1px solid var(--stroke-tertiary);
		}
	}
	.info-container {
		margin-top: 15px;
	}
	.checkbox-container {
		display: inline-flex;
		flex-direction: row-reverse;
		justify-content: flex-start;
		margin-top: 15px;
		align-items: center;
	}
	.card-title {
		color: var(--text-header);
		font-weight: 400;
		margin: 0;
		margin-bottom: 10px;
		font-size: 16px;
		display: block;
	}
	.button-container {
		display: flex;
		justify-content: flex-end;
	}
	.form-row {
		display: flex;
		justify-content: space-between;
		&-col {
			flex-basis: 30%;
		}
		&-col-50 {
			flex-basis: 45%;
		}
	}
</style>
