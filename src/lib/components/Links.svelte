<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getLinkIconProps } from '$utils/links';
	import Button from '$lib/components/Button.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import EditLinks from '$lib/components/EditLinks.svelte';
	import Icon from '$lib/components/Icon';
	import { bind } from '$lib/components/Modal.svelte';

	export let links: string[] = [];
	const dispatch = createEventDispatcher();

	const updateLinks = (link: string) => {
		links = [...links, link];
	};

	const checkLinkExists = (link: string) => links.includes(link);

	const openLinksModal = () => {
		dispatch('openLinks', {
			modal: bind(EditLinks, {
				saveData: updateLinks,
				customInvalidFunc: checkLinkExists,
				customInvalidMessage: 'Link already exists',
				close: () => {},
			}),
		});
	};

	const removeLink = (index: number) => {
		links.splice(index, 1);
		links = links;
	};
</script>

{#if links.length > 0}
	<div class="modal-info">
		<div class="link-icons" id="profile-links">
			{#each links as link, index}
				<span class="link">
					<a href={link} target="_blank" rel="noreferrer">
						<Icon {...getLinkIconProps(link)} />
						{link}
					</a>
					<CloseButton position="4px" size="10px" on:click={() => removeLink(index)} />
				</span>
			{/each}
		</div>
	</div>
{/if}
<div class="modal-button">
	<Button
		buttonProps={{ type: 'button', id: 'links' }}
		type="tertiary"
		size="md"
		on:click={openLinksModal}
	>
		Add
	</Button>
</div>

<style lang="scss">
	.modal-button {
		padding-bottom: 16px;
		margin-bottom: 16px;
		border-bottom: 1px solid var(--stroke-tertiary);
		display: flex;
		flex-direction: column;
	}

	.modal-info {
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		border: 0.4px solid var(--stroke-tertiary);
		margin-bottom: 16px;
		color: var(--text-secondary);

		.link-icons {
			display: flex;
			flex-direction: column;
			gap: 8px;

			.link {
				position: relative;
			}

			a {
				color: var(--icon-action-primary);
				display: flex;
				align-items: center;
				gap: 8px;
				margin-right: 25px;
				word-break: break-all;
			}
		}
	}
</style>
