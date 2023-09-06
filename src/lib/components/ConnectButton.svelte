<script lang="ts">
	import {
		connectedAccount,
		connectedAccountBalance,
		web3Connect,
		web3Disconnect,
		getSupportedNetworks,
		switchNetwork,
		chainId,
	} from '$stores/web3';
	import { currentPageNumber } from '$stores';
	import Icon from '$lib/components/Icon';
	import { userNotificationCenter } from '$utils/firestore';
	import { checkUserTwitterVerified, connectTwitter } from '$utils/firebase';
	import { updateUserFirebase } from '$utils/users/user';
	import { browser } from '$app/environment';
	import EthAmount from './ETHAmount.svelte';
	import Trans from './Trans.svelte';
	import EnsOrAddress from './EnsOrAddress.svelte';
	import OwnerCrown from './OwnerCrown.svelte';
	import Button from './Button.svelte';

	/**
	 * TODO: refactor out ugly classes/styles
	 */

	let buttonElement: HTMLElement;
	let opened = false;
	let selectingNetwork = false;
	let address: string;
	let unsubscribe: () => void = () => {};
	let unreadMessages = 0;
	let validNetwork: boolean = true;
	let twitter = '';

	connectedAccount.subscribe(async (account) => {
		address = account;
		if (account) {
			// Check if twitter verified
			const isTwitterVerified = await checkUserTwitterVerified($connectedAccount);
			if (isTwitterVerified) {
				twitter = isTwitterVerified;
			}
			// Notifications
			const { subscribe } = userNotificationCenter(account, {
				field: 'readAt',
				operator: '==',
				value: 0,
			});
			unsubscribe = subscribe((values) => {
				unreadMessages = values?.length ?? 0;
			});
		} else {
			unsubscribe();
		}
	});

	function windowClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!buttonElement?.contains(target)) {
			opened = false;
		}
	}

	async function handleTwitterAuth() {
		const { username, signature } = await connectTwitter();

		if (
			await updateUserFirebase($connectedAccount, (user) => {
				user.twitter = username;
				user.twitterSignature = signature;
				return user;
			})
		) {
			console.log('twitter connection saved');
			// Check if twitter verified
			const isTwitterVerified = await checkUserTwitterVerified($connectedAccount);
			if (isTwitterVerified) {
				twitter = isTwitterVerified;
			}
		}
	}

	$: showNetworks = opened ? selectingNetwork : false;
	$: networks = showNetworks ? getSupportedNetworks() || [] : [];
	$: if (browser) {
		validNetwork = localStorage.getItem('network') !== 'unknown';
	}
</script>

<svelte:window on:click={windowClick} />

{#if address}
	<div bind:this={buttonElement} class="buttonWrapper">
		{#if unreadMessages}
			<div class="badge" />
		{/if}
		<div
			class="connect-button"
			class:error={!validNetwork}
			on:click={() => {
				opened = !opened;
				if (!validNetwork) {
					selectingNetwork = true;
				}
			}}
			on:keydown
		>
			{#if !validNetwork}
				<span style="line-height: 22px;"> Wrong Network </span>
			{:else}
				<span style="line-height: 22px;">
					<EnsOrAddress {address} showTooltip={false} />
				</span>
				<div style="vertical-align: middle; line-height: 1; color: var(--text-tertiary);">
					{#if $connectedAccountBalance}
						<EthAmount amount={$connectedAccountBalance} precision={2} />
					{:else}
						<Icon name="loading" spin />
					{/if}
				</div>
			{/if}
		</div>
		{#if opened}
			<div style="position: absolute; top: 50px; left: 0px; width: 100%; user-select: none;">
				<div>
					<div class="ant-dropdown" style="padding: 0px; min-width: 164px; left: 0; top: 0;">
						<ul class="ant-dropdown-menu" role="menu" tabindex="0" data-menu-list="true">
							{#if address && validNetwork}
								<li
									class="ant-dropdown-menu-item"
									role="menuitem"
									tabindex="-1"
									data-menu-id="rc-menu-uuid-56979-2-0"
									style="padding: 10px 15px;"
								>
									<span class="ant-dropdown-menu-title-content">
										<a
											class="hover-action"
											href="https://etherscan.io/address/{address}"
											target="_blank"
											rel="noopener noreferrer"
											style="font-weight: 400;">{address.slice(0, 6)}...{address.slice(-4)}</a
										>
										<span>
											<span
												role="img"
												aria-label="copy"
												tabindex="-1"
												on:click={() => globalThis?.navigator?.clipboard.writeText(address)}
												on:keydown
											>
												<Icon name="copy" />
											</span>
											<span role="img">
												{#if twitter}
													<a
														href="https://twitter.com/{twitter}"
														target="_blank"
														rel="noopener noreferrer"
														><Icon name="twitter" />
													</a>
												{/if}
											</span>
										</span>
									</span>
								</li>

								{#if !twitter}
									<li
										class="ant-dropdown-menu-item"
										role="menuitem"
										tabindex="-1"
										data-menu-id="rc-menu-uuid-56979-2-1"
										style="padding: 10px 15px; color: var(--text-primary) display: flex; justify-content: space-between;"
									>
										<span
											class="ant-dropdown-menu-title-content my-projects-link"
											on:click|preventDefault={() => {
												void handleTwitterAuth();
											}}
											on:keydown
										>
											<Trans>Connect Twitter</Trans>
											<span role="img" aria-label="logout" style="padding-left: 31px;">
												<Icon name="twitter" />
												<!-- <Icon name="logout" /> -->
											</span>
										</span>
									</li>
								{/if}
								<li
									class="ant-dropdown-menu-item"
									role="menuitem"
									tabindex="-1"
									data-menu-id="rc-menu-uuid-56979-2-1"
									style="padding: 10px 15px; color: var(--text-primary) display: flex; justify-content: space-between;"
								>
									<a
										href="/projects?tab=myprojects"
										class="ant-dropdown-menu-title-content my-projects-link"
										on:click={() => {
											opened = false;
										}}
									>
										<Trans>My Projects</Trans>
										<span role="img" aria-label="logout" style="padding-left: 31px;">
											<OwnerCrown />
											<!-- <Icon name="logout" /> -->
										</span>
									</a>
								</li>
								<li
									class="ant-dropdown-menu-item"
									role="menuitem"
									tabindex="-1"
									data-menu-id="rc-menu-uuid-56979-2-1"
									style="padding: 10px 15px; color: var(--text-primary) display: flex; justify-content: space-between;"
								>
									<!-- TODO: should we attach the network here to fix the flashing? -->
									<a
										href="/user/{$connectedAccount}/collections"
										class="ant-dropdown-menu-title-content my-projects-link"
										on:click={() => {
											opened = false;
											currentPageNumber.set(0);
										}}
									>
										<Trans>My Collections</Trans>
										<span role="img" aria-label="logout" style="padding-left: 5px;">
											<Icon name="picture" viewBox="0 0 512 512" />
										</span>
									</a>
								</li>
								<li
									class="ant-dropdown-menu-item"
									role="menuitem"
									tabindex="-1"
									data-menu-id="rc-menu-uuid-56979-2-1"
									style="padding: 10px 15px; color: var(--text-primary) display: flex; justify-content: space-between;"
								>
									<a
										href="/user/{$connectedAccount}/notifications"
										class="ant-dropdown-menu-title-content my-projects-link"
										on:click={() => {
											opened = false;
										}}
									>
										<Trans>My Messages</Trans>
										<span role="img" aria-label="logout" style="padding-left: 31px;">
											<span>+{unreadMessages}</span>
										</span>
									</a>
								</li>
							{/if}
							<li
								class="ant-dropdown-menu-item"
								role="menuitem"
								tabindex="-1"
								data-menu-id="rc-menu-uuid-56979-2-1"
								style="padding: 10px 15px; color: var(--text-primary) display: flex; justify-content: space-between;{selectingNetwork
									? 'opacity: 0.5;'
									: ''}"
							>
								<span
									class="ant-dropdown-menu-title-content"
									on:click={() => {
										selectingNetwork = !selectingNetwork;
									}}
									on:keydown
								>
									<Trans>Switch Network</Trans>
									<span role="img" aria-label="logout" style="padding-left: 6px;">
										<!-- <Icon name="chain" /> -->
									</span>
								</span>
							</li>
							{#if showNetworks}
								{#each networks as net}
									<li
										class="ant-dropdown-menu-item"
										role="menuitem"
										tabindex="-1"
										data-menu-id="rc-menu-uuid-56979-2-1"
										style="padding: 10px 15px; color: var(--text-primary) display: flex; justify-content: space-between;"
										title={net.label}
									>
										<span
											class="ant-dropdown-menu-title-content"
											style={$chainId === Number(net.id) ? 'font-weight: bold;' : ''}
											on:click={async () => {
												await switchNetwork(Number(net.id));
												opened = false;
											}}
											on:keydown
										>
											{#await net.label.replace('Ethereum ', '') then label}
												{label.length > 16 ? `${label.slice(0, 16)}...` : label}
											{/await}
										</span>
									</li>
								{/each}
							{/if}
							<li
								class="ant-dropdown-menu-item"
								role="menuitem"
								tabindex="-1"
								data-menu-id="rc-menu-uuid-56979-2-1"
								style="padding: 10px 15px; color: var(--text-primary) display: flex; justify-content: space-between;"
							>
								<span
									class="ant-dropdown-menu-title-content"
									on:click={() => {
										opened = false;
										void web3Disconnect();
									}}
									on:keydown
								>
									<Trans>Disconnect</Trans>
									<span role="img" aria-label="logout">
										<Icon name="logout" viewBox="0 0 1000 1000" />
									</span>
								</span>
							</li>
						</ul>
						<div aria-hidden="true" style="display: none;" />
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div>
		<Button size="md" type="primary" on:click={() => web3Connect()}>Connect</Button>
	</div>
{/if}

<style>
	.buttonWrapper {
		position: relative;
		border: 1px solid var(--accent);
	}
	.connect-button {
		height: 45px;
		border-radius: 2px;
		padding: 4px 19px 7px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--background-l2);
		user-select: none;
		cursor: pointer;
	}
	.error {
		background: var(--background-failure);
	}

	/* Legacy styles that we want to get rid of at some point */
	.ant-dropdown {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		color: var(--text-primary);
		font-size: 14px;
		font-variant: tabular-nums;
		line-height: 1.5715;
		list-style: none;
		font-feature-settings: 'tnum';
		position: absolute;
		top: -9999px;
		left: -9999px;
		z-index: 1050;
		display: block;
	}
	.ant-dropdown::before {
		position: absolute;
		top: -4px;
		right: 0;
		bottom: -4px;
		left: -7px;
		z-index: -9999;
		opacity: 0.0001;
		content: ' ';
	}

	.ant-dropdown-menu {
		position: relative;
		margin: 0;
		padding: 4px 0;
		text-align: left;
		list-style-type: none;
		background-color: var(--background-l1);
		background-clip: padding-box;
		border-radius: 2px;
		outline: none;
		box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
			0 9px 28px 8px rgba(0, 0, 0, 0.05);
	}

	.ant-dropdown-menu-item {
		clear: both;
		margin: 0;
		padding: 5px 12px;
		color: var(--text-primary);
		font-weight: normal;
		font-size: 14px;
		line-height: 22px;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.3s;
	}

	.ant-dropdown-menu-item {
		position: relative;
		display: flex;
		align-items: center;
	}
	.ant-dropdown-menu-item a,
	.ant-dropdown-menu-item > span {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.ant-dropdown-menu-item > span > span {
		display: flex;
		/* justify-content: center; */
		/* gap: 1rem; */
	}

	span[role='img'] {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		transform: translateY(2px);
	}

	.ant-dropdown-menu-title-content {
		flex: auto;
	}
	.ant-dropdown-menu-title-content > a {
		color: inherit;
		transition: all 0.3s;
	}
	.ant-dropdown-menu-title-content > a:hover {
		color: inherit;
	}
	.ant-dropdown-menu-title-content > a::after {
		position: absolute;
		top: 0;
		right: 4rem;
		bottom: 0;
		left: 0;
		content: '';
	}
	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 8px;
		height: 8px;
		border-radius: 50%;
		background: red;
	}
	.my-projects-link {
		color: var(--text-primary);
	}
</style>
