<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import EditCollectionImagesModal from '$lib/components/minter/edit/EditCollectionImagesModal.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import CollectionSection from '$lib/components/sections/CollectionSection.svelte';
	import type { Collection } from '$models/minter/collection-config';
	import type { Writable } from 'svelte/store';

	export let form: Writable<Collection>;
	export let title: string;
	export let readonly: boolean = false;

	const resetFile = (property: 'logo' | 'defaultImage' | 'banner') => {
		$form[property] = '';
	};

	const setImages = (logo: string, defaultImage: string, banner: string) => {
		form.update((collection) => {
			collection.logo = logo;
			collection.defaultImage = defaultImage;
			collection.banner = banner;

			return collection;
		});
	};

	const openImageModal = () => {
		openModal(
			bind(EditCollectionImagesModal, {
				saveData: setImages,
				logo: $form.logo,
				defaultImage: $form.defaultImage,
				banner: $form.banner,
				readonly,
				close: () => {},
			}),
		);
	};

	function getImagesButtonText(collection: Collection) {
		if (readonly) return 'View images';
		if (collection.logo || collection.banner || collection.defaultImage) {
			return 'Edit';
		} else {
			return 'Add';
		}
	}

	$: imagesButtonText = getImagesButtonText($form);
</script>

{#if $form.logo || $form.banner || $form.defaultImage || !readonly}
	<CollectionSection {title}>
		{#if $form.logo || $form.banner || $form.defaultImage}
			<div class="modal-info">
				{#if $form.logo}
					<div class="imageLinkWrapper">
						Logo:
						<span class="hash">
							<a href={$form.logo} target="_blank" rel="noreferrer">{$form.logo}</a>
							{#if !readonly}
								<CloseButton position="4px" size="10px" on:click={() => resetFile('logo')} />
							{/if}
						</span>
					</div>
				{/if}
				{#if $form.defaultImage}
					<div class="imageLinkWrapper">
						Default image:
						<span class="hash">
							<a href={$form.defaultImage} target="_blank" rel="noreferrer">{$form.defaultImage}</a>
							{#if !readonly}
								<CloseButton
									position="4px"
									size="10px"
									on:click={() => resetFile('defaultImage')}
								/>
							{/if}
						</span>
					</div>
				{/if}
				{#if $form.banner}
					<div class="imageLinkWrapper">
						Banner:
						<span class="hash">
							<a href={$form.banner} target="_blank" rel="noreferrer">{$form.banner}</a>
							{#if !readonly}
								<CloseButton position="4px" size="10px" on:click={() => resetFile('banner')} />
							{/if}
						</span>
					</div>
				{/if}
			</div>
		{/if}
		<Button buttonProps={{ type: 'button' }} type="tertiary" size="md" on:click={openImageModal}>
			{imagesButtonText}
		</Button>
	</CollectionSection>
{/if}

<style>
	.modal-info {
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		border: 0.4px solid var(--stroke-tertiary);
		color: var(--text-secondary);
	}

	.imageLinkWrapper {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.hash {
		font-weight: 300;
		margin-bottom: 4px;
		word-break: break-all;
	}
</style>
