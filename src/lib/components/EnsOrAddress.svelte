<script lang="ts">
	import axios from 'axios';
	import { BigNumber, utils } from 'ethers';
	import { onMount } from 'svelte';
	import { formattedNum } from '$utils/formatNumber';
	import Icon from '$lib/components/Icon';
	import { getTruncatedAddress } from '$lib/utils/getTruncatedAddress';
	import { getEnsAddress } from '$lib/utils/getResolvedEns';
	import AddressTooltip from './AddressTooltip.svelte';
	import Ethereum from './Ethereum.svelte';
	import GnosisAddress from './GnosisAddress.svelte';
	import Popover from './Popover.svelte';
	import type { DeepDaoData } from 'src/app';

	export let address: string;
	export let truncate = true;
	export let prependEnsWithAt = false;
	export let showTooltip = true;
	export let token: { symbol: string; decimals: number; image: string } = null;
	export let ourPlatform = false;

	let mounted = false;
	let deepdao: DeepDaoData;
	let ens: string = '';

	onMount(() => {
		mounted = true;
	});

	// NOTE: commented out while we don't have deepdao
	// $: if (address) {
	// 	getDeepDaoScore(address).then((res) => (deepDao = res));
	// }
	// async function getDeepDaoScore(address: string) {
	// 	const CACHE_KEY = 'DEEPDAO_CACHE';
	// 	const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
	// 	if (cache[address] && cache[address].cached_at > Date.now() - 1000 * 60 * 60 * 24 * 10) {
	// 		return cache[address];
	// 	}
	// 	const { data } = await axios(
	// 		`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL}/app/deepdao/score/${address}`,
	// 		{
	// 			headers: {
	// 				apikey: import.meta.env.VITE_API_KEY
	// 			}
	// 		}
	// 	);
	// 	if (data && data.date) {
	// 		localStorage.setItem(
	// 			CACHE_KEY,
	// 			JSON.stringify({
	// 				...cache,
	// 				[address]: {
	// 					...(data || {}),
	// 					cached_at: Date.now()
	// 				}
	// 			})
	// 		);
	// 	}
	// 	return data;
	// }

	async function getGnosisBalanceInEth(_address: string) {
		try {
			const { data } = await axios(
				`${
					import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string
				}/app/gnosis/balances/${utils.getAddress(_address)}/total`,
				{
					headers: {
						apikey: import.meta.env.VITE_API_KEY as string,
					},
				},
			);
			if (data?.ethValue) {
				return BigNumber.from(data?.ethValue);
			}
			return BigNumber.from(0);
		} catch (error) {
			console.error(error);
		}
	}

	// NOTE: owner recognized as any for some reasons in HTML but its type is string
	const getEtherscanLink = (owner): string => {
		return `https://etherscan.io/address/${owner as string}`;
	};

	$: {
		ens = getTruncatedAddress(address);
		getEnsAddress(address, truncate, prependEnsWithAt)
			.then((name) => (ens = name))
			.catch(() => (ens = getTruncatedAddress(address)));
	}
</script>

{#if mounted}
	<span>
		<GnosisAddress
			address={address ? utils.getAddress(address) : undefined}
			let:isGnosis
			let:owners
			let:threshold
			let:pendingTransactions
		>
			<div class="align">
				{#if ens}
					{#if showTooltip}
						<AddressTooltip {address} {token} {deepdao} {ourPlatform}>
							{ens}
						</AddressTooltip>
					{:else}
						{ens}
					{/if}
				{/if}

				{#if isGnosis && Array.isArray(owners)}
					<Popover maxWidth="250px" placement="top">
						<span class="gnosis-icon">
							<Icon name="gnosis" />
						</span>
						<div slot="content" class="owners">
							{#if owners?.length}
								<small>Threshold: {threshold} / {owners?.length}</small>
							{/if}
							{#await getGnosisBalanceInEth(address)}
								<small>Balance: ...</small>
							{:then balance}
								<small
									>Balance: <Ethereum />{formattedNum(balance, {
										thousandsSeparator: ',',
									})}
								</small>
							{/await}
							<small>Pending Txns: {(pendingTransactions || []).length}</small>
							{#each owners || [] as owner}
								<div class="owner">
									<a href={getEtherscanLink(owner)} target="_blank" rel="noreferrer">
										<svelte:self address={owner} showTooltip={false} />
										<Icon name="etherscan" style="transition: none;" />
									</a>
								</div>
							{/each}
						</div>
					</Popover>
				{/if}
			</div>
		</GnosisAddress>
	</span>
{/if}

<style>
	span {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
	}
	.owners {
		display: flex;
		flex-direction: column;
	}
	.align {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.owner,
	.owner a {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.gnosis-icon {
		transform: translateY(2px);
	}
</style>
