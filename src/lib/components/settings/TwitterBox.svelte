<script lang="ts">
	import { popupLogin, userdata } from '$utils/firebase';
	import { connectedAccount } from '$stores/web3';
	import { getLastTweet } from '$utils/twitter';
	import HeavyBorderBox from '../HeavyBorderBox.svelte';
	import Button from '../Button.svelte';

	import AccountPreview from './AccountPreview.svelte';

	let lastTweetId = 0;
	let interval: any;

	const show = $userdata ? $userdata.providerData[0].providerId === 'twitter' : false;

	$: showStep = 1;
	$: signature = '';
	$: messageTweet = '';
	$: watch = false;

	const activeProtocol = { social: 'Twitter', emoji: '', id: '', token: { symbol: 'SYMBOL' } };

	async function changeTwitterAccount() {
		await popupLogin('twitter_auth');
	}

	const readableTweetCopy = (sign) =>
		`${activeProtocol?.emoji ?? ''}Verifying myself as a ${activeProtocol?.social} #${
			activeProtocol?.token?.symbol
		} Delegate on Project Name 🏛\n url.xyz \n addr:${String($connectedAccount)} \n sig:${
			String(sign) ?? ''
		}`;

	const tweetCopyForLink = (sign) =>
		`${activeProtocol?.emoji ?? ''}Verifying myself as a ${activeProtocol?.social} %23${
			activeProtocol?.token?.symbol
		} Delegate on Project Name🏛️%0A%0AProject Name%0A%0Aaddr:${String(
			$connectedAccount,
		)}%0A%0Asig:${String(sign) ?? ''}`;

	const startWatching = (message) => {
		watch = true;
		window.open(
			`https://twitter.com/intent/tweet?text=${String(message)}`,
			'tweetWindow',
			'height=400,width=800,top=400px,left=400px',
		);
	};

	const verification = async () => {
		// await saveVerefictaionData({
		// 	...$userdata,
		// 	verificationTweetId: lastTweetId,
		// 	wallet: $connectedAccount,
		// });
	};

	const getTweet = async () => {
		if (watch) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const fetchData = await getLastTweet($userdata.username);
			const { data, meta } = fetchData;
			if (meta.result_count) {
				const [tweet] = data;
				const passedRegex = tweet.text.includes(`sig:${String(signature)}`);
				if (passedRegex) {
					lastTweetId = tweet.id;
					globalThis.twttr.widgets.createTweet(tweet.id, document.getElementById('tweet'));
				}
				watch = false;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				clearInterval(interval);
			}
		}
	};

	const nextStep =
		({ step }) =>
		({ detail }) => {
			switch (step) {
				case 'sig':
					signature = detail.sig;
					messageTweet = readableTweetCopy(detail.sig);
					showStep = 2;
					break;
				case 'announce':
					if (!watch && !lastTweetId) {
						startWatching(tweetCopyForLink(signature));
						interval = setInterval(getTweet, 4000);
					} else {
						verification().catch((e) => console.log(e));
					}
					break;
			}
		};
</script>

<!-- eslint-disable -->
<HeavyBorderBox>
	<span class="card-title">Connect Twitter</span>
	<p>
		To access leadership, project, and other enahanced trust badgers you must reveal your identity
		by connecting your Ethereum address to your Twitter account. You must approve each Twitter
		service we have access too.
	</p>
	{#if show}
		{#if !$userdata.verification}
			{#if showStep == 1}
				<div class="container-verification">
					<span class="verification-title">Step 1: Sign Message</span>
					<small class="verification-description">
						Sign in with Twitter to link your Ethereum address and Twitter handle.
					</small>
					<AccountPreview user={$userdata} on:signature={nextStep({ step: 'sig' })} />
				</div>
			{:else if showStep == 2}
				<div class="container-verification">
					<span class="verification-title">Step 2: Announce</span>
					<span class="verification-description">
						Sign in with Twitter to link your Ethereum address and Twitter handle.
					</span>
					{#if !lastTweetId}
						<div class="copie-block">
							<span>{messageTweet}</span>
						</div>
					{/if}
					<div id="tweet" />
					<Button on:click={nextStep({ step: 'announce' })} disabled={watch}>
						{watch ? 'Looking for tweet...' : !lastTweetId ? 'Send tweet' : 'Submit'}
					</Button>
				</div>
			{/if}
		{:else}
			<span
				>Hello {$userdata.name}. You are already verified
				<a
					target="_blank"
					href={`https://twitter.com/${String($userdata.username)}`}
					rel="noreferrer">@{String($userdata.username)}</a
				>.</span
			>
		{/if}
	{:else}
		<div class="box-button">
			<Button on:click={changeTwitterAccount}>Twitter Login</Button>
		</div>
	{/if}
</HeavyBorderBox>

<style lang="scss">
	.card-title {
		color: var(--text-header);
		font-weight: 400;
		margin: 0;
		margin-bottom: 10px;
		font-size: 16px;
		display: block;
	}
	.container-verification {
		border: 1px solid var(--text-header);
		padding: 20px;
		margin: 0 auto;

		.copie-block {
			background: white;
			padding: 20px;
		}

		.verification-title {
			display: block;
			color: var(--text-header);
			margin-bottom: 5px;
		}
		.verification-description {
			display: block;
			margin-bottom: 5px;
		}
	}
	.box-button {
		display: flex;
		justify-content: flex-end;
	}
</style>
