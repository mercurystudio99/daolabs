<script lang="ts">
	import QrScanner from 'qr-scanner';
	import Button from '$lib/components/Button.svelte';
	import { combine } from './util/combine';

	const shares = [];
	let countShares = 0;
	let secretPhrase = '';
	let qrScanner;

	const startScan = () => {
		const videoContainer = document.getElementById('video-container');
		const videoElm = document.createElement('video');
		videoElm.id = 'video';
		videoElm.style.cssText = 'width: 100%;';
		videoContainer.append(videoElm);

		qrScanner = new QrScanner(
			document.getElementById('video') as HTMLVideoElement,
			(result) => {
				if (shares.length < 3) {
					if (shares.find((share) => share === result.data)) {
						alert('Share existing');
					} else {
						shares.push(result.data);
						countShares += 1;
					}
				} else {
					qrScanner.stop();
					secretPhrase = combine(shares).toString();
				}
			},
			{
				highlightScanRegion: true,
				highlightCodeOutline: true,
			},
		);
		qrScanner.start();
	};

	const stopScan = () => {
		const videoContainer = document.getElementById('video-container');
		videoContainer.innerHTML = '';
		qrScanner.stop();
	};
</script>

<span class="card-title">Recovery secret key</span>
Count shares {countShares} <br />
<div class="button-container">
	<Button on:click={startScan}>Start scaning</Button>
	<Button type="secondary" on:click={stopScan}>Stop scaning</Button>
</div>
{#if !secretPhrase}
	<div id="video-container" />
{:else}
	Secret Pharase: {secretPhrase}
{/if}

<style lang="scss">
	.button-container {
		display: flex;
		justify-content: flex-end;
	}
	.card-title {
		color: var(--text-header);
		font-weight: 400;
		margin: 0;
		margin-bottom: 10px;
		font-size: 16px;
		display: block;
	}
	#video-container {
		margin-top: 20px;
	}
</style>
