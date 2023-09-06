<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import Modal, { bind } from '$lib/components/Modal.svelte';
	import EditAdditionalSettingsModal from '$lib/components/minter/edit/EditAdditionalSettingsModal.svelte';
	import type { SvelteComponent } from 'svelte';

	export let saveData: (unlockable: boolean, sensitive: boolean, freeze: boolean) => void;

	export let unlockable: boolean;
	export let sensitive: boolean;
	export let freeze: boolean;

	let modal: SvelteComponent;

	$: settings = [
		{
			label: 'Unlockable Content',
			description:
				'Unlockable content is content that is not visible to the public until the NFT is purchased.',
			value: unlockable,
		},
		{
			label: 'Sensitive Content',
			value: sensitive,
		},
		{
			label: 'Freeze Metadata',
			value: freeze,
		},
	];

	function onSave(_unlockable: boolean, _sensitive: boolean, _freeze: boolean) {
		unlockable = _unlockable;
		sensitive = _sensitive;
		freeze = _freeze;
		saveData(unlockable, sensitive, freeze);
	}

	const openAdditionalModal = () => {
		modal = bind(EditAdditionalSettingsModal, {
			saveData: onSave,
			unlockable,
			sensitive,
			freeze,
		});
	};

	$: additionalButtonText = unlockable || sensitive || freeze ? 'Edit' : 'Add';
</script>

<div class="wrapper">
	{#each settings as setting}
		{#if setting.value}
			<div class="setting">
				<Icon name="checkCircle" />
				<span> {setting.label} </span>
			</div>
		{/if}
	{/each}
	<Button
		buttonProps={{ type: 'button', id: 'additional-settings' }}
		type="tertiary"
		size="md"
		on:click={openAdditionalModal}
	>
		{additionalButtonText}
	</Button>
</div>
<Modal show={modal} />

<style>
	.setting {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}
	.wrapper {
		margin-bottom: 16px;
		color: var(--text-secondary);
	}
</style>
