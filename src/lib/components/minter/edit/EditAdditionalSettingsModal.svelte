<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import PopInfo from '$lib/components/PopInfo.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import FormBlock from '../form-block/FormBlock.svelte';
	/*
	TODO: Tooltip text
	*/
	export let close;
	export let saveData: (unlockable, sensitive, freeze) => void;

	export let unlockable: boolean;
	export let sensitive: boolean;
	export let freeze: boolean;

	const add = () => {
		saveData(unlockable, sensitive, freeze);
		close();
	};

	$: disabled = !(unlockable || sensitive || freeze);
</script>

<section>
	<h2>Output Settings</h2>
	<div class="switch-item">
		<div class="switch-title">
			<Toggle id="unlockableContent" bind:checked={unlockable}>
				<h3>
					<PopInfo message="tolltip text" placement="bottom">Unlockable Content</PopInfo>
				</h3>
			</Toggle>
		</div>
		<p class="description">
			Include unlockable content that can only be revealed by the owner of the item.
		</p>
	</div>
	<div class="switch-item">
		<div class="switch-title">
			<Toggle id="sensitiveContent" bind:checked={sensitive}>
				<h3>
					<PopInfo message="Tooltip text" placement="bottom">Explicit & Sensitive Content</PopInfo>
				</h3>
			</Toggle>
		</div>
		<p class="description">Set this item as explicit and sensitive content.</p>
	</div>
	<FormBlock title="Freeze metadata" info="Tooltip text">
		<p class="description">
			Freezing your metadata will allow you to permanently lock and store all of this item’s content
			in decentralized storage
		</p>
		<div class="freeze-button-container">
			<Button
				type={freeze ? 'primary' : 'secondary'}
				size="md"
				buttonProps={{ type: 'button' }}
				on:click={() => (freeze = !freeze)}>{freeze ? 'Unfreeze' : 'Freeze'}</Button
			>
		</div>
	</FormBlock>
	<Button
		size="md"
		type={disabled ? 'tertiary' : 'primary'}
		buttonProps={{ type: 'button' }}
		on:click={add}
	>
		Save
	</Button>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		max-width: 542px;
		width: min(542px, 75vw);
		overflow-x: hidden;

		.description {
			font-weight: 500;
			font-size: 14px;
			line-height: 16px;
			color: var(--text-secondary);
			margin: 0;
		}

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}
		.freeze-button-container {
			margin-top: 10px;
			margin-left: auto;
		}

		.switch-item {
			margin-bottom: 16px;

			.switch-title {
				display: flex;
				align-items: center;
				margin-bottom: 8px;

				h3 {
					color: var(--text-header);
					font-size: 14px;
					font-weight: 400;
					margin: 0;
				}
			}
		}
	}
</style>
