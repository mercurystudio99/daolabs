<script lang="ts">
	import { locale as localeI18n } from '$lib/translations';
	import Icon from '$lib/components/Icon';
	import clickOutsideDirective from '$utils/clickOutside';
	import Collapse from './Collapse.svelte';

	let isOpen = false;

	export let languages = [
		['en', 'EN'],
		['zh', '中文'],
		['ru', 'RU'],
		['tr', 'TR'],
		['fr', 'FR'],
		['es', 'ES'],
		['pt', 'PT'],
	];

	function setLocale(locale: string) {
		localeI18n.set(locale.toLocaleLowerCase());
		isOpen = false;
	}
</script>

<Collapse bind:isOpen>
	<span class="centered">
		<Icon name="global" />
	</span>
	{($localeI18n && $localeI18n.toLocaleUpperCase()) || 'EN'}
	<div
		slot="content"
		use:clickOutsideDirective
		on:clickOutside={() => {
			isOpen = false;
		}}
	>
		{#each languages as [lang, langName]}
			<div class="option" aria-selected="false" on:click={() => setLocale(lang)} on:keydown>
				<div class="label">{langName}</div>
				<span unselectable aria-hidden="true" style="user-select: none;" />
			</div>
		{/each}
	</div>
</Collapse>

<style>
	.centered {
		line-height: 0;
		margin-right: 10px;
	}

	.label {
		flex: auto;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.option {
		position: relative;
		display: block;
		min-height: 32px;
		padding: 5px 14px;
		font-weight: 400;
		font-size: 14px;
		line-height: 22px;
	}

	.option:hover {
		background-color: var(--background-l2);
	}
</style>
