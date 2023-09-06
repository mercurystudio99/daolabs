<script lang="ts">
	import { afterUpdate } from 'svelte';
	import { copyToClipboard } from '$utils/clipboard';
	import Icon from '$lib/components/Icon';
	import SlideUpInfo from '$lib/components/SlideUpInfo.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import PopInfo from './PopInfo.svelte';

	export let value: string;
	export let label: string = '';
	export let id: string = '';
	export let description: string = '';
	export let maxlength = 0;
	export let info = '';
	export let maxHeight = 0;
	export let transparent = false;
	export let readonly = false;
	export let shouldAutoResize = true;

	let textarea: HTMLTextAreaElement;

	function autosize() {
		setTimeout(() => {
			if (!maxHeight || textarea.scrollHeight < maxHeight) {
				textarea.style.cssText = 'height:auto; padding:0';
				textarea.style.cssText = `height:${String(textarea.scrollHeight)}px`;
			} else {
				textarea.style.cssText = 'height:auto; padding:0';
				textarea.style.cssText = `height:${maxHeight}px`;
			}
		}, 0);
	}

	let loaded = false;
	afterUpdate(() => {
		if (!loaded && shouldAutoResize) {
			autosize();
		}
		loaded = true;
	});
</script>

<div class="container" id={`${id}-wrap`}>
	{#if info}
		<label for={id}>
			<PopInfo message={info}>
				{label}
			</PopInfo>
		</label>
	{:else if label}
		<label for={id}>{label}</label>
	{/if}
	<div class="area">
		<textarea
			{...$$restProps}
			{...maxlength ? { maxlength } : {}}
			{readonly}
			bind:value
			on:keydown={autosize}
			bind:this={textarea}
			on:blur
			class:transparent
		/>
		<div class="addon">
			<slot name="addon" />
			{#if readonly}
				<Popover message="Copy" onClick={() => copyToClipboard(value)}>
					<SlideUpInfo>
						<Icon name="copy" style="color: gray; cursor: crosshair;" />
					</SlideUpInfo>
				</Popover>
			{/if}
		</div>
	</div>
	<div class="info">
		{#if description}
			{description}
		{/if}
		{#if maxlength}
			<span class="max-length">{`${value ? value.length : 0} / ${maxlength}`}</span>
		{/if}
	</div>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
	}
	label {
		margin: 10px 0px;
		margin-right: 10px;
		color: var(--text-header);
	}
	textarea {
		width: 100%;
		height: auto;
		background: var(--background-l0);
		min-height: 28px;
		font-size: 14px;
		font-weight: 300;
		list-style: none;
		-webkit-font-feature-settings: 'tnum', 'tnum';
		font-feature-settings: 'tnum', 'tnum';
		position: relative;
		display: inline-block;
		padding: 4px 11px;
		color: var(--text-primary);
		line-height: 1.5715;
		border: 1px solid var(--stroke-secondary);
		border-radius: var(--radius-md);
		transition: border-color 120ms ease-out;
		&::placeholder {
			color: var(--text-tertiary);
			font-weight: 300;
		}
		&:not(:disabled):focus {
			border: var(--accent) 1px solid;
			outline: none;
		}
		&.transparent {
			background: transparent;
		}
		&:not(:disabled):hover {
			border: var(--accent) 1px solid;
		}
	}

	textarea[readonly] {
		background: var(--background-l1);
		border: 1px solid var(--stroke-tertiary);
		cursor: crosshair;
	}

	.addon {
		position: absolute;
		top: 5px;
		right: 10px;
		height: 20px;
	}

	.area {
		position: relative;
		display: flex;
		align-items: center;
	}

	:global(.area > *[slot='addon']) {
		position: absolute;
		right: 5px;
	}

	.info {
		margin-top: 4px;
		display: flex;
		gap: 16px;
		color: var(--text-secondary);
		font-weight: 300;
		font-size: 14px;

		.max-length {
			margin-left: auto;
			min-width: fit-content;
		}
	}
</style>
