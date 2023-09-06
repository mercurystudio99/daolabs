<script lang="ts">
	export let label = '';
	export let name = 'radio';
	export let color = 'gray';
	export let disabled: boolean = false;
	export let value: string = '';
	export let group: string = '';
</script>

<div class="radio">
	<label class={`container ${color}`} class:disabled>
		{label}
		<input type="radio" {name} {disabled} bind:group {value} />
		<span class="checkmark" />
	</label>
</div>

<style lang="scss">
	.container {
		display: flex;
		align-items: center;
		position: relative;
		padding-left: 26px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		&.gray {
			color: var(--text-primary);
		}
		input {
			position: absolute;
			opacity: 0;
			cursor: pointer;
			height: 0;
			width: 0;
		}

		&.disabled input:checked ~ .checkmark {
			background-color: #ccc;
			border: 1px solid #ccc;
		}
	}

	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 19px;
		width: 19px;
		background-color: var(--icon-over-action-primary);
		border-radius: 50%;
		border: 1px solid #ccc;
	}

	.container:hover input ~ .checkmark {
		background-color: #ccc;
	}

	.container input:checked ~ .checkmark {
		background-color: var(--text-header);
		border: 1px solid var(--text-header);
	}

	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
	}

	.container input:checked ~ .checkmark:after {
		display: block;
	}

	.container .checkmark:after {
		top: 4px;
		left: 4px;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--icon-over-action-primary);
	}
</style>
