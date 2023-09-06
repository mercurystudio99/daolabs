<script lang="ts">
	import { getCollections } from '$data/nft';
	import Icon from '$lib/components/Icon';
	import Input from '$lib/components/Input.svelte';

	import {
		searchText,
		hasSearched,
		searchResults,
		isSearching,
		sortType,
	} from '$stores/collectionsForm';

	const handleClear = () => {
		$searchText = '';
		$hasSearched = false;
	};

	const handleSubmit = async () => {
		if ($searchText.length === 0) {
			handleClear();
			return;
		}

		$isSearching = true;

		$searchResults = (
			await getCollections({
				filter: { types: [], deployed: true },
				sort: $sortType,
			})
		).filter((result) => {
			if (
				result.id.includes($searchText.toLocaleLowerCase()) ||
				result.name.toLocaleLowerCase().includes($searchText.toLocaleLowerCase())
			)
				return true;
			return false;
		});
		$hasSearched = true;
		$isSearching = false;
	};
</script>

<form on:submit|preventDefault={handleSubmit}>
	<Input bind:value={$searchText} placeholder="Search collections by title or id" type="text">
		<div slot="addon">
			{#if $searchText}
				<Icon name="closeCircle" on:click={handleClear} />
			{/if}
		</div>
	</Input>

	<style>
		div[slot='addon'] {
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0;
			height: 100%;
			display: flex;
			align-items: flex-end;
			justify-content: center;
		}
		div[slot='addon']:hover {
			color: var(--icon-action-primary);
		}
	</style>
</form>
