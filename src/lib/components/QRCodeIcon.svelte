<script lang="ts">
	import { copyToClipboard } from '$utils/clipboard';
	import Icon from '$lib/components/Icon';

	export let valueToCopyOnClick: string = '';
	export let showModalOnClick: () => void;
	let copied = false;

	function copy() {
		copyToClipboard(valueToCopyOnClick).catch((e) => console.log(e));
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1500);
	}
</script>

<span
	role="button"
	class="clickable-icon"
	on:click={showModalOnClick || copy}
	on:keydown
	class:scale-down-center={copied}
>
	{#if copied}
		<span class="slide-top">
			<Icon name="copy" />
		</span>
	{/if}
	<Icon name="qr" />
</span>

<style>
	:root {
		--color: var(--icon-action-primary);
		--active: var(--icon-over-action-primary-highlight);
	}
	span {
		display: flex;
		align-items: center;
	}
	.clickable-icon {
		position: relative;
		cursor: pointer;
		color: var(--color);
		margin: 0px 5px;
		font-size: 1em;
	}
	.clickable-icon:hover {
		color: var(--icon-over-action-primary-highlight);
	}
	/* This is also used in QRCode component, potentially put in a action directive */
	.slide-top {
		font-size: 10px;
		position: absolute;
		animation: slide-top 0.8s linear both;
	}

	@keyframes slide-top {
		0% {
			transform: translateY(-20px);
		}
		100% {
			transform: translateY(-80px);
			opacity: 0;
		}
	}

	.scale-down-center {
		animation: scale-down-center 0.4s;
	}

	@keyframes scale-down-center {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(0.9);
		}
	}
</style>
