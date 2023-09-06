<script lang="ts">
	import Toggle from '$lib/components/Toggle.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import type { AttrModification } from '$models/minter/nft-config';

	export let freeze: boolean;
	export let attrModification: AttrModification;
</script>

<div class="wrapper">
	<div class="setting" class:active={freeze}>
		<Toggle bind:checked={freeze} /> Freeze Metadata
	</div>
	{#if attrModification}
		<div class="setting" class:active={attrModification.name.status}>
			<Toggle id="nameMode" bind:checked={attrModification.name.status} /> Attribute Name Modification
		</div>
		<div class="sub-settings" class:hidden={!attrModification.name.status}>
			<div class="setting">
				<Checkbox bind:checked={attrModification.name.removeUnderscore} />Remove undescores
			</div>
			<div class="setting">
				<Radio
					name="nameSentenceCase"
					value="sentenceCase"
					bind:group={attrModification.name.capStatus}
					size="1.4em"
					thick="0.1em"
					margin="0 20px 0 0"
				/>Use sentence case
			</div>
			<div class="setting">
				<Radio
					name="nameAllCaps"
					value="allCaps"
					bind:group={attrModification.name.capStatus}
					size="1.4em"
					thick="0.1em"
					margin="0 20px 0 0"
				/>Use ALL CAPS
			</div>
		</div>
		<div class="setting" class:active={attrModification.value.status}>
			<Toggle id="valueMode" bind:checked={attrModification.value.status} /> Attribute Value Modification
		</div>
		<div class="sub-settings" class:hidden={!attrModification.value.status}>
			<div class="setting">
				<Checkbox bind:checked={attrModification.value.removeUnderscore} />Remove undescores
			</div>
			<div class="setting">
				<Radio
					name="valueSentenceCase"
					value="sentenceCase"
					bind:group={attrModification.value.capStatus}
					size="1.4em"
					thick="0.1em"
					margin="0 20px 0 0"
				/>Use sentence case
			</div>
			<div class="setting">
				<Radio
					name="valueAllCaps"
					value="allCaps"
					bind:group={attrModification.value.capStatus}
					size="1.4em"
					thick="0.1em"
					margin="0 20px 0 0"
				/>Use ALL CAPS
			</div>
		</div>
	{/if}
</div>

<style>
	.active {
		color: var(--text-primary);
	}

	.setting {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.sub-settings {
		margin-left: 20px;
		height: 100px;
		overflow: hidden;
		transition: all 0.2s;
	}

	.hidden {
		height: 0;
	}

	.wrapper {
		margin-bottom: 16px;
		color: var(--text-secondary);
	}
</style>
