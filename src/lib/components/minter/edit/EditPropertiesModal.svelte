<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import BoostCreation from '../attributes-creation/BoostCreation.svelte';
	import LevelCreation from '../attributes-creation/LevelCreation.svelte';
	import PropertyCreation from '../attributes-creation/PropertyCreation.svelte';

	import StatCreation from '../attributes-creation/StatCreation.svelte';
	import FormBlock from '../form-block/FormBlock.svelte';
	import type { Attributes, NumericAttribute, Boost, Attribute } from '$models/minter/nft-config';
	/*
	TODO: Tooltip text
	*/
	export let close = () => {};
	export let saveData: (attributes: Attributes) => void;

	export let attributes: Attributes;

	const add = () => {
		saveData(attributes);
		close();
	};
	let isDuplicatedProperty;

	const removeProperty = (index: number) => {
		attributes.properties.splice(index, 1);
		attributes.properties = attributes.properties;
	};

	const saveProperty = (newProperty: Attribute) => {
		attributes.properties = [...attributes.properties, { ...newProperty }];
	};

	const removeLevel = (index: number) => {
		attributes.levels.splice(index, 1);
		attributes.levels = attributes.levels;
	};
	const saveLevel = (newLevel: NumericAttribute) => {
		attributes.levels = [...attributes.levels, { ...newLevel }];
	};

	const removeStat = (index: number) => {
		attributes.stats.splice(index, 1);
		attributes.stats = attributes.stats;
	};
	const saveStat = (newStat: NumericAttribute) => {
		attributes.stats = [...attributes.stats, { ...newStat }];
	};

	const removeBoost = (index: number) => {
		attributes.boosts.splice(index, 1);
		attributes.boosts = attributes.boosts;
	};
	const saveBoost = (newBoost: Boost) => {
		attributes.boosts = [...attributes.boosts, { ...newBoost }];
	};

	$: disabled =
		(attributes.properties.length <= 0 || isDuplicatedProperty) &&
		attributes.levels.length <= 0 &&
		attributes.stats.length <= 0 &&
		attributes.boosts.length <= 0;
</script>

<section>
	<h2>Properties</h2>
	<FormBlock
		title="Properties"
		info="Properties are the most common type of NFT trait. More unique properties are typically more desirable."
		borderRadius="0"
	>
		<p class="description">
			Properties are text values which show up underneath your item on marketplaces, and are used to
			sort and search through your collection.
		</p>
		<PropertyCreation
			bind:isDuplicatedProperty
			properties={attributes.properties}
			{removeProperty}
			{saveProperty}
		/>
	</FormBlock>
	<FormBlock
		title="Levels"
		info="Levels usually represent the strength of a trait. Higher levels are typically more desirable."
		borderRadius="0"
	>
		<p class="description">
			Levels are numeric values which show up underneath your item on marketplaces as a progress
			bar.
		</p>
		<LevelCreation levels={attributes.levels} {removeLevel} {saveLevel} />
	</FormBlock>
	<FormBlock
		title="Stats"
		info="Stats are usually an identifier. More unique stats are typically more desirable."
		borderRadius="0"
	>
		<p class="description">
			Stats are numeric values which show up underneath your item on marketplaces as a numeric
			value.
		</p>
		<StatCreation stats={attributes.stats} {removeStat} {saveStat} />
	</FormBlock>
	<FormBlock
		title="Boosts"
		info="Boosts are usually a stat or power-up. Larger boosts are typically more desirable."
		borderRadius="0"
	>
		<p class="description">
			Boosts are numeric values which show up underneath your item on marketplaces as a boost or a
			power-up.
		</p>
		<BoostCreation boosts={attributes.boosts} {removeBoost} {saveBoost} />
	</FormBlock>
	<Button size="md" {disabled} buttonProps={{ type: 'button' }} on:click={add}>Add</Button>
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
		}

		h2 {
			color: var(--text-header);
			margin-bottom: 16px;
		}
	}
</style>
