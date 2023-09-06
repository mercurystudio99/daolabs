<script lang="ts">
	import { toDataURL } from 'qrcode';
	import { onMount } from 'svelte';
	import { copyToClipboard } from '$utils/clipboard';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import Icon from '$lib/components/Icon';

	export let value: string;
	let copied = false;
	let color = '#111';

	function copyAddressToClipboard() {
		copyToClipboard(value).catch((e) => console.log(e));
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1500);
	}

	onMount(() => {
		// Getting the document root variables and setting from them causes weird behaviour
		// const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
		const htmlClass = document.documentElement.className;
		if (htmlClass.includes('darkmode')) {
			color = '#e1e0e8';
		} else {
			color = '#111';
		}
	});
</script>

<figure>
	<!-- Light corresponds to transparent background -->
	{#await toDataURL(value, { color: { dark: color, light: '#0000' } })}
		<Icon name="loading" spin />
	{:then QR}
		<div class="qrcode">
			{#if copied}
				<span class="slide-top">
					<Icon name="copy" /> Copied
				</span>
			{/if}
			<img src={QR} alt={'QR Code'} on:click={copyAddressToClipboard} on:keydown />
		</div>
	{/await}
	<figcaption>
		<p><EnsOrAddress address={value} /></p>
	</figcaption>
</figure>

<style>
	figure {
		margin: 0 auto;
		text-align: center;
	}

	figcaption {
		color: var(--text-secondary);
	}
	.qrcode {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.qrcode:hover {
		cursor: pointer;
	}

	.slide-top {
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
</style>
