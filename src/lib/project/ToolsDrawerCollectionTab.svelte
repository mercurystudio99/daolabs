<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import HeavyBorderBox from '$lib/components/BorderBox.svelte';
	import Input from '$lib/components/Input.svelte';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { uploadProjectMetadata } from '$utils/ipfs';
	import { getCollectionById } from '$utils/users/user';
	import { web3Transact } from '$lib/transaction';
	import { setMetadataOf } from '$utils/web3/JBProjects';
	import PendingTransaction from '$lib/components/PendingTransaction.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import { getProjectPlatform } from '$lib/projects/data';
	import { JUICEBOX_MONEY_METADATA_DOMAIN } from '$constants/v2/metadataDomain';
	import { CollectionType } from '$models/minter/collection-config';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project = getContext<Store<V2ProjectContextType>>('PROJECT');
	let errorMessage = '';
	let inputRef: HTMLInputElement = null;
	let value = '';

	let collectionUrls: string[] = [];
	let saving = false;

	function getIdFromUrl(url: string) {
		let regex = /\/collection\/([^?]+)/;
		let match = url.match(regex);
		if (match) {
			return match[1];
		}
		return null;
	}

	async function addUrl() {
		const valid = inputRef.checkValidity();
		if (!valid) {
			errorMessage = inputRef.validationMessage;
			return;
		} else if (collectionUrls.includes(value)) {
			errorMessage = 'Collection already added';
			return;
		}
		const id = getIdFromUrl(value);
		if (!id) {
			errorMessage = 'Invalid collection url';
			return;
		} else {
			const collection = await getCollectionById(id);
			if (!collection) {
				errorMessage = 'Collection does not exist';
				return;
			}
			if (collection.type === CollectionType.SIMPLE) {
				errorMessage = 'Edition collections not yet supported';
				return;
			}
		}

		collectionUrls = [...collectionUrls, value];
		value = '';
	}

	function removeUrl(url: string) {
		collectionUrls = collectionUrls.filter((u) => u !== url);
		value = '';
	}

	async function save() {
		try {
			saving = true;
			const metadata = $project.projectMetadata;
			const collections = collectionUrls.map((u) => getIdFromUrl(u));
			const uploadedMetadata = await uploadProjectMetadata({
				...metadata,
				// @ts-ignore @eslint-ignore
				collections,
			});
			const cid = uploadedMetadata.IpfsHash;

			if (cid) {
				const txnResponse = await web3Transact(
					'setMetadataOf',
					setMetadataOf,
					getProjectPlatform(project),
					$project.projectId,
					cid,
					JUICEBOX_MONEY_METADATA_DOMAIN,
				);

				openModal(
					bind(PendingTransaction, {
						txnResponse,
						functionName: 'setMetadataOf',
						close: () => {},
					}),
				);
				const txnResult = await txnResponse.wait();
				console.log(txnResult);
				// reload the treasury
				window.location.reload();
			}
		} catch (e) {
			console.error(e);
		} finally {
			saving = false;
		}
	}

	onMount(() => {
		if (!$project?.collections) return;
		collectionUrls = $project.collections.map((c) => `https://move.xyz/collection/${c}`);
	});

	$: urlsChanged = collectionUrls.join(',') !== $project.collections?.join(',');
</script>

<InfoBox>Showcase collections on this treasury page by adding the collection's url below.</InfoBox>
<br />
<HeavyBorderBox>
	<h4>Add collection</h4>
	<p>Enter the collection's url below.</p>
	{#each collectionUrls as url}
		<div class="urlItem">
			<p>{url}</p>
			<p>
				<CloseButton size="0.5rem" position="0.2rem" on:click={() => removeUrl(url)} />
			</p>
		</div>
	{/each}
	<br />
	<Input
		type="url"
		required
		bind:inputRef
		bind:value
		on:focus={() => (errorMessage = '')}
		placeholder="https://move.xyz/collection/1t280rroten"
	/>
	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
	<div class="buttons">
		<Button type="secondary" size="md" on:click={addUrl}>Add</Button>
	</div>
</HeavyBorderBox>
{#if urlsChanged}
	<div class="buttons">
		<Button type="primary" size="md" on:click={save} loading={saving}>Save</Button>
	</div>
{/if}

<style>
	.buttons {
		display: flex;
		justify-content: flex-end;
		margin-top: 8px;
	}

	.error {
		color: var(--text-error);
	}

	.urlItem {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid var(--stroke-tertiary);
		border-radius: var(--radius-md);
		position: relative;
		margin-bottom: 8px;
	}

	.urlItem p {
		margin: 8px 16px;
	}
</style>
