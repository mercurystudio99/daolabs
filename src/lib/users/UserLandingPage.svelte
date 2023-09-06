<script lang="ts" context="module">
	export function showEditControlsDirective(node: HTMLElement) {
		if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
			let showEditControls = false;
			let timeout: NodeJS.Timeout = null;

			const clickHandler = () => {
				showEditControls = !showEditControls;
				node.dispatchEvent(new CustomEvent('showEditControls', { detail: showEditControls }));

				if (timeout) {
					clearTimeout(timeout);
				}

				if (showEditControls) {
					timeout = setTimeout(() => {
						showEditControls = false;
						node.dispatchEvent(new CustomEvent('showEditControls', { detail: showEditControls }));
					}, 2000);
				}
			};

			node.addEventListener('click', clickHandler);

			return {
				destroy() {
					if (timeout) {
						clearTimeout(timeout);
					}
					node.removeEventListener('click', clickHandler);
				},
			};
		} else {
			const mouseEnterHandler = () => {
				node.dispatchEvent(new CustomEvent('showEditControls', { detail: true }));
			};

			const mouseLeaveHandler = () => {
				node.dispatchEvent(new CustomEvent('showEditControls', { detail: false }));
			};

			node.addEventListener('mouseenter', mouseEnterHandler);
			node.addEventListener('mouseleave', mouseLeaveHandler);

			return {
				destroy() {
					node.removeEventListener('mouseenter', mouseEnterHandler);
					node.removeEventListener('mouseleave', mouseLeaveHandler);
				},
			};
		}
	}
</script>

<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import { constants } from 'ethers';
	import { computePosition, autoPlacement } from '@floating-ui/dom';
	import { isAddress } from 'ethers/lib/utils';
	import { modal, modalOptions, currentPageNumber } from '$stores';
	import { connectedAccount, readNetwork, web3Connect } from '$stores/web3';
	import { changeUserData, userdata } from '$utils/firebase';
	import { ipfsCidUrl, replaceIpfsDomain } from '$utils/ipfs';
	import { myProjectsQuery } from '$data/project';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
	import Modal, { bind, openModal } from '$lib/components/Modal.svelte';
	import NftTypeModal from '$lib/components/NftTypeModal.svelte';
	import LinksDisplay from '$lib/components/LinksDisplay.svelte';
	import {
		defaultUser,
		removeCollection,
		saveUserCollection,
		saveUserFirebase,
		type User,
	} from '$utils/users/user';
	import MissingImage from '$lib/components/minter/icons/MissingImage.svelte';
	import DropzoneModal from '$lib/components/DropzoneModal.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import EnsOrAddress from '$lib/components/EnsOrAddress.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { generateTile } from '$utils/tilesStandalone';
	import ConfirmDeleteModal from '$lib/components/minter/modal/ConfirmDeleteModal.svelte';
	import {
		userPageOptions,
		collectionOptions,
		revenueSplitOptions,
		projectsOptions,
		assetsOptions,
	} from '$utils/introjs/options';
	import { createCustomNotification } from '$utils/notification';
	import {
		deleteRevenueSplitById,
		handleRevenueSplitChange,
		saveRevenueSplit,
		updateRevenueSplit,
	} from '$utils/users/revenueSplitsHelpers';
	import { isSimpleCollection } from '$utils/collectionHelpers';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ConnectWalletModal from './ConnectWalletModal.svelte';
	import type { Collection } from '$models/minter/collection-config';
	import type { RevenueSplit } from '$models/user/revenue-splits';
	import type { ProjectV2 } from '$models/subgraph-entities/vX/project';
	import type { DropzoneOutput } from '$models/dropzone';
	import type { Balance } from '$services/users/getWalletTokens';

	function getCurrentTab(tab: string) {
		switch (tab) {
			case 'collections':
				return 3;
			case 'revenue':
				return 1;
			case 'projects':
				return 2;
			case 'notifications':
				return 4;
			default:
				return 0;
		}
	}

	export let currentTab = getCurrentTab($page.params?.tab);
	export let address = '';
	export let balances: Balance[] = [];

	let placeholderTile = {
		address: '',
		tile: '',
	};

	let user: typeof defaultUser = $userdata || {
		name: defaultUser.name,
		displayName: defaultUser.displayName,
		description: defaultUser.description,
		avatar: defaultUser.avatar,
		banner: defaultUser.banner,
		links: defaultUser.links,
		collections: defaultUser.collections,
		revenueSplits: defaultUser.revenueSplits,
		legalContent: defaultUser.legalContent,
		hashtags: defaultUser.hashtags,
		uid: defaultUser.uid,
	};

	let unsubscribeUserData = () => {};
	let unsubscribeConnectedAccount = () => {};
	let unsubscribeReadNetwork = () => {};

	let projects: ProjectV2[] = [];

	function fetchMyProjects(_address: string) {
		myProjectsQuery('daolabs', _address)
			.then((res) => (projects = res))
			.catch((err) => console.error(err));
	}

	let userAddress: string;

	let showBannerUpload = false;
	let showSettings = false;
	let showSplitsDrawer = false;
	let showTool = false;
	let highlighted = -1;

	$: userAddress = address || String($connectedAccount);

	const openSettings = () => {
		showSettings = true;
	};

	const createNft = async (data: Collection) => {
		if (!Array.isArray(user.collections)) {
			user.collections = [];
		}

		if (data.royalty?.creator_address) {
			const newRoyaltySplit = await handleRevenueSplitChange(
				undefined,
				data.royalty?.creator_address,
				data.name,
				'collectionRoyalty',
			);
			if (newRoyaltySplit) {
				data.royalty.creator_address = newRoyaltySplit;
			}
		}

		if (isSimpleCollection(data) && data.payoutAddress) {
			const newPayoutSplit = await handleRevenueSplitChange(
				undefined,
				data.payoutAddress,
				data.name,
				'collectionPricing',
			);
			if (newPayoutSplit) {
				data.payoutAddress = newPayoutSplit;
			}
		}

		try {
			if (await saveUserCollection(data)) {
				await changeUserData($userdata ? $userdata.uid : userAddress);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const openNftTypeModal = () => {
		openModal(bind(NftTypeModal, { createNft, close: () => {} }));
	};

	const saveProfile = async (data: User) => {
		if (!userAddress) {
			openModal(
				bind(ConnectWalletModal, { confirmCallback: () => web3Connect(), close: () => {} }),
			);
		}
		await saveUserFirebase($userdata ? $userdata.uid : userAddress, data);
	};

	const openUserCreation = () => {
		showSettings = !showSettings;
	};

	let warningModal;

	const goToProjectCreate = () => {
		goto('/create').catch((e) => console.log(e));
	};

	let selectedSplit = 0;
	const openSplitsDrawer = (index: number) => {
		selectedSplit = index;
		showSplitsDrawer = true;
	};

	const createAction = () => {
		if (!$userdata.uid) {
			openUserCreation();
		} else {
			switch (currentTab) {
				case 3:
					openNftTypeModal();
					break;
				case 1:
					openSplitsDrawer(user.revenueSplits?.length || 0);
					break;
				case 2:
					goToProjectCreate();
					break;
			}
		}
	};

	const saveSplits = async (split: RevenueSplit) => {
		const action =
			'firebaseId' in split && split.firebaseId ? updateRevenueSplit : saveRevenueSplit;

		try {
			if (await action(split)) {
				await saveUserFirebase($userdata ? $userdata.uid : userAddress, user);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const deleteSplit = async (index: number) => {
		await deleteRevenueSplitById(user.revenueSplits[index].firebaseId);
		user.revenueSplits.splice(index, 1);
		await saveProfile(user);
	};

	const openBannerDropzone = () => {
		openModal(
			bind(DropzoneModal, {
				title: 'Edit banner',
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				close: () => {},
				saveChanges: (file: DropzoneOutput) => {
					if (!file) {
						user.banner = '';
					} else {
						user.banner = ipfsCidUrl(file.pinInfo.IpfsHash);
					}
					if ($userdata) {
						saveProfile(user).catch((e) => console.log(e));
					}
				},
			}),
		);
	};

	const discardBanner = () => {
		user.banner = '';
		saveProfile(user).catch((e) => console.log(e));
	};

	let showAvatarUpload = false;

	const openAvatarDropzone = () => {
		openModal(
			bind(DropzoneModal, {
				title: 'Edit avatar',
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				close: () => {},
				saveChanges: (file: DropzoneOutput) => {
					if (!file) {
						user.avatar = '';
					} else {
						user.avatar = ipfsCidUrl(file.pinInfo.IpfsHash);
					}
					if ($userdata) {
						saveProfile(user).catch((e) => console.log(e));
					}
				},
			}),
		);
	};

	const discardAvatar = () => {
		user.avatar = '';
		saveProfile(user).catch((e) => console.log(e));
	};

	const deleteCollection = (index: number, pageNo: number) => {
		openModal(
			bind(ConfirmDeleteModal, {
				onConfirm: async () => {
					try {
						const pageSize = 10;
						const coll: Collection = user.collections[index + pageNo * pageSize];
						await removeCollection(coll);
						user.collections.splice(index, 1);
						await saveProfile(user);
					} catch (e) {
						createCustomNotification({
							type: 'error',
							message: 'Error deleting collection',
							autoDismiss: 3000,
						});
						console.warn('[deleteCollection]', e);
					}
				},
				onCancel: () => {},
				label: 'collection',
			}),
		);
	};

	let descriptionExpanded = false;
	let descriptionRef: HTMLSpanElement;
	let descriptionWidth;
	let showMore = false;

	const expandDescription = () => {
		descriptionExpanded = true;
		showMore = false;
	};

	afterUpdate(() => {
		showMore = descriptionRef.scrollHeight > descriptionRef.clientHeight;
	});

	const handleStartIntroTour = (tabNumber: number) => {
		document.cookie = 'introjs-dontShowAgain=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
		const dontShowAgainNumber = parseInt(localStorage.getItem('introjs-dontshowagain') || '0');
		localStorage.setItem('introjs-dontshowagain', (dontShowAgainNumber + 1).toString());
		const options = {
			steps: [],
			dontShowAgain: dontShowAgainNumber < 5,
		};

		highlighted = tabNumber;

		switch (tabNumber) {
			case 0:
				options.steps = [
					...userPageOptions.steps.slice(1),
					...assetsOptions.steps,
					...collectionOptions.steps,
					...revenueSplitOptions.steps,
					...projectsOptions.steps,
				];
				break;
			case 1:
				options.steps = [
					...userPageOptions.steps.slice(1),
					...revenueSplitOptions.steps,
					...assetsOptions.steps,
					...collectionOptions.steps,
					...projectsOptions.steps,
				];
				break;
			case 2:
				options.steps = [
					...userPageOptions.steps.slice(1),
					...projectsOptions.steps,
					...assetsOptions.steps,
					...collectionOptions.steps,
					...revenueSplitOptions.steps,
				];
				break;
			case 3:
				options.steps = [
					...userPageOptions.steps.slice(1),
					...collectionOptions.steps,
					...assetsOptions.steps,
					...revenueSplitOptions.steps,
					...projectsOptions.steps,
				];
				break;
		}

		// @ts-ignore
		const intro = introJs()
			.setOptions(options)
			.onafterchange((targetElement) => {
				switch (targetElement.id) {
					case 'user-collection':
						currentTab = 3;
						break;
					case 'user-revenue':
						currentTab = 1;
						break;
					case 'user-notifications':
						currentTab = 4;
						break;
					case 'user-projects':
						currentTab = 2;
						break;
					case 'user-assets':
						currentTab = 0;
						break;
				}
			})
			.onbeforechange(function () {
				if (this._introItems[this._currentStep].preChange) {
					this._introItems[this._currentStep].preChange();
				}
			})
			.onexit(() => {
				currentTab = highlighted;
				highlighted = -1;
			});

		let complete = null;

		// @ts-ignore
		introJs()
			.setOptions({
				steps: [userPageOptions.steps[0]],
				dontShowAgain: true,
				doneLabel: 'Next',
				showBullets: false,
			})
			.onskip(() => {
				complete = null;
			})
			.onbeforeexit(() => {
				if (complete != null) {
					complete();
				} else {
					highlighted = -1;
				}
			})
			.oncomplete(() => {
				complete = () => {
					setTimeout(() => {
						intro.start();
					});
				};
			})
			.start();
	};

	onMount(async () => {
		unsubscribeConnectedAccount = connectedAccount.subscribe(async (_account: string) => {
			if (_account && !address) {
				await changeUserData(_account);
				placeholderTile = {
					address: _account,
					tile: generateTile(_account),
				};
				fetchMyProjects(_account);
			}
			if (!_account && !address) {
				user = defaultUser;
				await changeUserData('');
			}
		});

		unsubscribeUserData = userdata.subscribe((_user) => {
			if (_user) {
				if (!_user.avatar && !_user.banner) {
					const userId = isAddress(_user.displayName) ? _user.displayName : _user.uid;
					placeholderTile = {
						address: userId,
						tile: generateTile(userId),
					};
				}
				user = _user;
				if (user.displayName === constants.AddressZero) {
					user.displayName = address || defaultUser.displayName;
				}
			}
		});

		unsubscribeReadNetwork = readNetwork.subscribe(() => {
			if ($connectedAccount || userAddress) {
				fetchMyProjects(String($connectedAccount || userAddress));
			}
		});

		if (userAddress) {
			await changeUserData(userAddress);
			user = $userdata;
			fetchMyProjects(userAddress);
			placeholderTile = {
				address: userAddress,
				tile: generateTile(userAddress),
			};
		}
	});

	onDestroy(() => {
		unsubscribeUserData();
		unsubscribeConnectedAccount();
		unsubscribeReadNetwork();
	});

	const triggerAvatarEditControls = ({ detail: show }: CustomEvent<boolean>) => {
		showAvatarUpload = show;

		const popoverRef = document.getElementById('popover-buy-tile');
		if (popoverRef) {
			if (show) {
				computePosition(popoverRef.parentElement, popoverRef, {
					middleware: [autoPlacement()],
					placement: 'right',
				})
					.then((result) => {
						Object.assign(popoverRef.style, {
							position: result.strategy,
							left: `${result.x}px`,
							top: `${result.y}px`,
						});
						popoverRef.style.visibility = 'visible';
					})
					.catch((e) => console.log(e));
			} else {
				popoverRef.style.visibility = 'hidden';
			}
		}
	};

	$: {
		if (descriptionRef && descriptionWidth) {
			showMore = descriptionExpanded
				? false
				: descriptionRef.scrollHeight > descriptionRef.clientHeight;
		}
	}

	$: hashtagsArray = user.hashtags ? user.hashtags.replace(/ /g, '').split(',', 5) : [];
	$: isOwner = userAddress.toLowerCase() === $connectedAccount.toLowerCase();

	$: route = address ? `/user/${address}` : '/user';
</script>

{#if user}
	<div
		class="banner"
		style={`background-image: url(${replaceIpfsDomain(user.banner) || ''})`}
		class:missing={!user.banner}
		use:showEditControlsDirective
		on:showEditControls={(e) => {
			showBannerUpload = e.detail;
		}}
	>
		{#if showBannerUpload && isOwner}
			<div class="banner-edit-icon" on:click={openBannerDropzone} on:keydown>
				<Icon name="edit" viewBox="0 0 36 36" />
			</div>
			{#if user.banner}
				<CloseButton position="8px" on:click|once={discardBanner} color="--icon-action-primary" />
			{/if}
		{:else if !user.banner}
			<div class="icon">
				<MissingImage width="40" height="37" />
			</div>
		{/if}
	</div>
	<section class:no-banner={!user.banner}>
		<div class="user-info">
			<div class="info">
				<div
					class="avatar"
					use:showEditControlsDirective
					on:showEditControls={triggerAvatarEditControls}
				>
					{#if !user.avatar || !isOwner}
						<div id="popover-buy-tile" class="buy-tile">
							<a href={`https://tiles.wtf/mint/${placeholderTile.address}?animate`}>
								Mint your tile
							</a>
						</div>
					{/if}
					<div class="wrapper">
						{#if user.avatar}
							<img src={user.avatar} alt="{user.displayName} avatar" />
						{:else}
							<div class="tile">
								{@html placeholderTile.tile}
							</div>
						{/if}
						{#if showAvatarUpload && isOwner}
							<div class="edit-icon">
								<div class="icon" on:click={openAvatarDropzone} on:keydown>
									<Icon name="edit" viewBox="0 0 36 36" />
								</div>
							</div>
							{#if user.avatar}
								<CloseButton
									size="0.7rem"
									position="6px"
									on:click|once={discardAvatar}
									color="--icon-action-primary"
								/>
							{/if}
						{/if}
					</div>
				</div>
				<h1>
					{#if user.displayName?.match(/^0x[0-9a-fA-F]{40,40}$/)}
						<EnsOrAddress address={user.displayName} />
					{:else}
						{user.displayName}
					{/if}
				</h1>
				<div class="links">
					<LinksDisplay links={user.links} stripHandle={false} />
					{#if user.legalContent}
						<a
							id="legal-doc"
							class="vertical-center"
							href={`${$page.url.origin}/user/legal/${address}`}
							target="_blank"
							rel="noreferrer"
						>
							<Icon name="book" viewBox="0 0 448 512" />
							Legal
						</a>
					{/if}
				</div>
				{#if isOwner}
					<div class="settings">
						<Popover
							message="Guide"
							onClick={() => {
								handleStartIntroTour(currentTab);
							}}
						>
							<Icon name="lifePreserver" width="0.9em" />
						</Popover>
						<!-- <Icon name="tool" on:click={openTool} /> -->
						<Popover message="Open settings drawer" onClick={openSettings}>
							<Icon id="profile-setting" name="setting" on:click={openSettings} />
						</Popover>
					</div>
				{/if}
			</div>
			<div class="description-wrap">
				<span
					class="description"
					class:expanded={descriptionExpanded}
					bind:this={descriptionRef}
					bind:clientWidth={descriptionWidth}
				>
					{user.description}
					{#each hashtagsArray as hashtag}
						{#if hashtag}
							{`#${hashtag.toString()} `}
						{/if}
					{/each}
				</span>
				{#if showMore}
					<span class="more" on:click={expandDescription} on:keydown>Read more</span>
				{/if}
			</div>
		</div>
		<div class="tabs-wrap">
			<div class="tabs">
				<a href="{route}/assets">
					<button
						id="user-assets"
						class:selected={currentTab === 0}
						class:highlighted={highlighted === 0}
						on:click={() => {
							currentTab = 0;
							highlighted = -1;
						}}
					>
						ASSETS
					</button>
				</a>

				<a href="{route}/collections">
					<button
						id="user-collection"
						class:selected={currentTab === 3}
						class:highlighted={highlighted === 3}
						on:click={() => {
							currentTab = 3;
							highlighted = -1;
							currentPageNumber.set(0);
						}}
					>
						{user.collections ? user.collections.length : ''} COLLECTIONS
					</button>
				</a>

				<a href="{route}/revenue">
					<button
						id="user-revenue"
						class:selected={currentTab === 1}
						class:highlighted={highlighted === 1}
						on:click={() => {
							currentTab = 1;
							highlighted = -1;
							currentPageNumber.set(0);
						}}
					>
						{user.revenueSplits ? user.revenueSplits.length : ''} REVENUE SPLIT
					</button>
				</a>

				{#if isOwner}
					<a href="{route}/notifications">
						<button
							id="user-notifications"
							class:selected={currentTab === 4}
							class:highlighted={highlighted === 4}
							on:click={() => {
								currentTab = 4;
								highlighted = -1;
							}}
						>
							NOTIFICATIONS
						</button>
					</a>
				{/if}

				<a href="{route}/projects">
					<button
						id="user-projects"
						class:selected={currentTab === 2}
						class:highlighted={highlighted === 2}
						on:click={() => {
							currentTab = 2;
							highlighted = -1;
							currentPageNumber.set(0);
						}}
					>
						{projects.length ? projects.length : ''} TREASURIES
					</button>
				</a>
			</div>
			{#if isOwner && currentTab !== 0 && currentTab !== 4}
				<div class="create" id="'create-button">
					<Button size="md" on:click={createAction}>Create</Button>
				</div>
			{/if}
		</div>
		{#if currentTab === 0}
			{#await import('./assets') then { default: Assets }}
				<svelte:component this={Assets} {userAddress} {balances} {route} />
			{/await}
		{:else if currentTab === 1}
			{#await import('./RevenueSplitsList.svelte') then { default: RevenueSplitsList }}
				<svelte:component
					this={RevenueSplitsList}
					splits={user.revenueSplits}
					splitsFailed={user.revenueFailed}
					{openSplitsDrawer}
					{deleteSplit}
					{userAddress}
				/>
			{/await}
		{:else if currentTab === 2}
			{#await import('./JuiceboxesList.svelte') then { default: JuiceboxesList }}
				<svelte:component this={JuiceboxesList} {projects} {userAddress} />
			{/await}
		{:else if currentTab === 3}
			{#await import('./CollectionList.svelte') then { default: CollectionList }}
				<svelte:component
					this={CollectionList}
					collections={user.collections}
					{deleteCollection}
					{userAddress}
				/>
			{/await}
		{:else}
			{#await import('./UserNotificationsList.svelte') then { default: NotificationsList }}
				<svelte:component this={NotificationsList} {userAddress} />
			{/await}
		{/if}
	</section>
{/if}
{#if showSettings}
	{#await import('./EditUserDrawer.svelte') then { default: EditUserDrawer }}
		<svelte:component this={EditUserDrawer} bind:shown={showSettings} {user} {saveProfile} />
	{/await}
{/if}
{#if showTool}
	{#await import('./UserToolDrawer.svelte') then { default: UserToolDrawer }}
		<svelte:component this={UserToolDrawer} bind:shown={showTool} />
	{/await}
{/if}
{#if showSplitsDrawer}
	{#await import('./RevenueSplitsDrawer.svelte') then { default: RevenueSplitsDrawer }}
		<svelte:component
			this={RevenueSplitsDrawer}
			bind:shown={showSplitsDrawer}
			split={user.revenueSplits ? user.revenueSplits[selectedSplit] : null}
			{saveSplits}
		/>
	{/await}
{/if}
<Modal key="UserLandingPage" show={$modal} {...$modalOptions} />
<Modal key="UserLandingPageWarning" show={warningModal} closeButton={false} />

<style lang="scss">
	:root {
		--onboard-modal-z-index: 1000;
	}
	.banner {
		width: 100%;
		height: 150px;
		background-repeat: no-repeat;
		background-size: cover;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	.missing {
		background: var(--background-l1);
	}
	.icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--text-tertiary);
		height: 100%;
		justify-content: center;
	}
	.banner-edit-icon {
		padding: 10px;
		background: var(--background-l0);
		border-radius: 50%;
		display: flex;
		cursor: pointer;
		font-size: 20px;
	}

	.vertical-center {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	section {
		max-width: 1104px;
		display: flex;
		flex-direction: column;
		margin: 16px auto;
		padding: 0 24px;
		position: relative;
		width: 100%;
		margin-bottom: auto;
		.user-info {
			display: flex;
			flex-direction: column;

			.info {
				position: relative;
				display: flex;
				flex-direction: column;
				padding-left: 144px;
				margin-top: 8px;
				margin-bottom: 4px;

				.avatar {
					width: 120px;
					height: 120px;
					position: absolute;
					left: 0;
					bottom: 0;
					border: none;

					.wrapper {
						position: relative;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.buy-tile {
						width: 180px;
						position: absolute;
						left: 0px;
						top: 0px;
						visibility: hidden;
						background: var(--background-l0);
						box-shadow: 0 2px 5px 0 rgb(0 0 0 / 26%);
						transition: visibility 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97);
						padding: 10px;
						z-index: 999;
						white-space: normal;
						text-transform: none;

						a {
							&:hover {
								text-decoration: underline;
							}
						}
					}

					.tile {
						display: flex;
						font-size: 120px;
						background: var(--background-l2);
					}

					img {
						object-fit: contain;
						width: 120px;
						height: 120px;
						border: none;
					}

					.edit-icon {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						display: flex;
						justify-content: center;
						align-items: center;

						.icon {
							padding: 4px;
							background: var(--background-l0);
							border-radius: 50%;
							display: flex;
							cursor: pointer;
							height: fit-content;
						}
					}
				}

				h1 {
					font-size: 21px;
					margin-bottom: 8px;
					margin-right: 50px;
					word-break: break-all;
					color: var(--text-header);
				}

				.links {
					color: var(--text-action-primary);
					display: flex;
					flex-wrap: wrap;
					column-gap: 40px;
				}

				.settings {
					position: absolute;
					top: 0px;
					right: 0;
					display: flex;
					gap: 14px;
					color: var(--text-action-primary);
					cursor: pointer;
					font-size: 1.25em;

					span {
						display: flex;
					}
				}
			}

			.description-wrap {
				position: relative;
				font-size: 14px;
				.description {
					color: var(--text-secondary);
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 3;
					line-clamp: 3;
					-webkit-box-orient: vertical;
					word-break: break-word;
					font-weight: 300;
					margin-top: 10px;
				}

				.expanded {
					display: block;
				}

				.more {
					position: absolute;
					bottom: 0;
					right: 0;
					background: var(--background-l0);
					color: var(--text-action-primary);
					cursor: pointer;
					&::before {
						content: '...';
						display: inline;
						margin: 0 5px;
						color: var(--text-secondary);
					}
				}
			}
		}

		.tabs-wrap {
			display: flex;
			margin-top: 20px;
			flex-wrap: wrap;
			gap: 10px;

			.create {
				margin-left: auto;
			}
			.tabs {
				display: flex;
				justify-content: center;
				column-gap: 50px;
				row-gap: 20px;
				flex-wrap: wrap;
				font-size: 16px;

				button {
					padding: 0;
					margin: 0;
					border: none;
					background: transparent;
					display: flex;
					align-items: center;
					justify-content: space-between;
					white-space: nowrap;
					width: fit-content;
					cursor: pointer;
					border-bottom: '2px solid';
					padding-bottom: 0px;
					font-weight: 500;
					color: var(--text-secondary);
					border-color: transparent;
				}
				.selected {
					color: var(--text-primary);
					border-color: var(--text-primary);
					font-weight: 600;
					border-bottom: 2px solid var(--text-primary);
				}
				.highlighted {
					color: var(--text-brand-primary);
				}
			}
		}
	}

	.no-banner {
		margin-top: 0px;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 767px) {
		.banner {
			margin-top: 74px;
		}
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		.tabs-wrap {
			.tabs {
				column-gap: 30px !important;
			}
		}

		section {
			.user-info {
				.info {
					padding-left: 0;
					padding-top: 12px;
					.links {
						column-gap: 20px;
					}
					.avatar {
						position: static;
						align-self: left;
						margin-top: -100px;
					}
					h1 {
						margin-right: 0px;
						text-align: center;
						position: relative;
						top: 8px;
					}
				}
			}
		}
	}
</style>
