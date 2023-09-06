<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import DrawerTabs from '$lib/components/DrawerTabs.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import FormInput from '$lib/components/minter/form/FormInput.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import { connectedAccount } from '$stores/web3';
	import { deepCopy } from '$utils/object';
	import Links from '$lib/components/Links.svelte';
	import { userProfileDrawerOptions } from '$utils/introjs/options';
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import DropzoneModal from '$lib/components/DropzoneModal.svelte';
	import { ipfsCidUrl, replaceIpfsDomain } from '$utils/ipfs';
	import { generateTile } from '$utils/tilesStandalone';
	import UserLegalTab from './UserLegalTab.svelte';
	import type { User } from '$utils/users/user';
	import type { DropzoneOutput } from '$models/dropzone';

	export let shown: boolean;
	export let user: User;
	export let saveProfile;
	const initialState = deepCopy(user);
	const invalid = {};

	/*
		TODO: Notes of additional panels to add, connect Twitter		
	*/

	const tabs = ['Profile', 'Legal'];
	const defaultDescription =
		'Welcome to your User landing page. From here you can access your Treasuries and NFT Collections, ' +
		'and other Web3 tools. Keep an eye out as we add tools for Treasury owners, artists, curators, ' +
		'and collectors to enable you to create captivating communities. Sign-in with your wallet to retain your settings.';
	let currentTab = 0;
	let placeholderTile: {
		address: string;
		tile: string;
	};

	const saveProfileChanges = async () => {
		if (user.hashtags) {
			const tags = user.hashtags.replace(/ /g, '-').replace(/#/g, '-').split(',');
			user.hashtags = '';
			for (const tag of tags) {
				user.hashtags += `${tag.replace(/^[-]+|[-]+$/g, '')},`;
			}
			user.hashtags = user.hashtags.replace(/[,]+$/g, '');
		}
		await saveProfile(user);
		shown = false;
	};

	let handleStartIntro = () => {
		currentTab = 0;
		setTimeout(() => {
			// @ts-ignore
			introJs()
				.setOptions(userProfileDrawerOptions)
				.oncomplete(() => {
					currentTab = 1;
					setTimeout(() => {
						// @ts-ignore
						introJs()
							.setOptions({
								steps: [
									{
										title: 'User Profile Legal Doc',
										element: '.drawer-container > section > section',
										intro:
											'Here you could see profile terms and could set custom terms of services below.',
									},
								],
							})
							.start();
					});
				})
				.start();
		});
	};

	const reset = () => {
		user = {
			name: '',
			displayName: '',
			description: '',
			avatar: '',
			banner: '',
			links: [],
			collections: [],
			hashtags: '',
		};
	};

	onMount(() => {
		if (!user.displayName && $connectedAccount) {
			user.displayName = $connectedAccount;
		}
		placeholderTile = {
			address: String($connectedAccount || user.displayName),
			tile: generateTile(String($connectedAccount || user.displayName)),
		};
	});

	const openBannerDropzone = () => {
		openModal(
			bind(DropzoneModal, {
				title: 'Edit banner',
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				close: () => {},
				saveChanges: (file: DropzoneOutput) => {
					if (file) {
						user.banner = ipfsCidUrl(file.pinInfo.IpfsHash);
					}
				},
			}),
		);
	};

	const openAvatarDropzone = () => {
		openModal(
			bind(DropzoneModal, {
				title: 'Edit avatar',
				accept: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
				close: () => {},
				saveChanges: (file: DropzoneOutput) => {
					if (file) {
						user.avatar = ipfsCidUrl(file.pinInfo.IpfsHash);
					}
				},
			}),
		);
	};

	const openLinksModal = (e: CustomEvent) => {
		openModal(e.detail.modal);
	};

	$: changed = Object.keys(user).some(
		(key) => JSON.stringify(user[key]) !== JSON.stringify(initialState[key]),
	);

	$: saveDisabled =
		!user.displayName || !changed || Object.keys(invalid).some((key) => user[key] && invalid[key]);

	$: hashtagsArray = user.hashtags ? user.hashtags.replace(/ /g, '').split(',') : [];
</script>

<Drawer bind:shown helpButton={true} bind:handleStartIntro>
	<section>
		<h2>Profile settings</h2>
		<DrawerTabs {tabs} bind:currentTab />
		{#if currentTab == 0}
			<HeavyBorderBox>
				<div class="wrapper" id="profile-banner">
					<span class="hash">
						<label for="banner">Banner</label>
						{#if user.banner}
							<CloseButton size="10px" on:click={() => (user.banner = '')} />
						{/if}
					</span>
					{#if user.banner}
						<img class="banner" src={replaceIpfsDomain(user.banner)} alt="user banner" />
					{/if}
					<Button size="md" type="tertiary" on:click={openBannerDropzone}>
						{user.banner ? 'Edit' : 'Add'}
					</Button>
				</div>
				<div class="wrapper" id="profile-avatar">
					<span class="hash">
						<label for="avatar">Avatar</label>
						{#if user.avatar}
							<CloseButton size="10px" on:click={() => (user.avatar = '')} />
						{/if}
					</span>
					<div class="avatar">
						{#if user.avatar}
							<img src={user.avatar} alt="User avatar" />
						{:else if placeholderTile}
							<div class="tile">
								{@html placeholderTile.tile}
							</div>
						{/if}
					</div>
					{#if !user.avatar && placeholderTile}
						<div class="buy-tile">
							<a href={`https://tiles.wtf/mint/${placeholderTile.address}?animate`}>
								Mint your tile
							</a>
						</div>
					{/if}
					<Button size="md" type="tertiary" on:click={openAvatarDropzone}>
						{user.avatar ? 'Edit' : 'Add'}
					</Button>
				</div>
				<div id="profile-name">
					<FormInput
						id="display-name"
						label="Display name"
						placeholder="Display name"
						bind:value={user.displayName}
					/>
				</div>
				<Textarea
					id="profile-description"
					label="Description"
					placeholder={defaultDescription}
					bind:value={user.description}
					maxlength={1000}
				/>
				<div id="profile-links">
					<h4>Links</h4>
					<Links bind:links={user.links} on:openLinks={openLinksModal} />
				</div>
				<div class="textarea-container" id="profile-hashtags">
					<label for="hashtags"> Hashtags </label>
					<textarea bind:value={user.hashtags} />
					<div class="info">
						Enter hashtags separated by commas
						<span class="max-length">
							{`${
								hashtagsArray[hashtagsArray.length - 1] === ''
									? String(hashtagsArray.length - 1)
									: String(hashtagsArray.length)
							} / ${10}`}
						</span>
					</div>
				</div>
				<div class="button-box">
					<Button fullWidth={true} size="md" type="tertiary" on:click={reset}>Reset</Button>
				</div>
				<div class="button-box">
					<Button
						fullWidth={true}
						size="md"
						on:click={changed ? saveProfileChanges : undefined}
						type={changed ? 'primary' : 'secondary'}
						disabled={saveDisabled}
					>
						{!$connectedAccount ? 'Connect wallet' : 'Save changes'}
					</Button>
				</div>
			</HeavyBorderBox>
		{:else if currentTab === 1}
			<UserLegalTab {user} {saveProfile} />
		{/if}
	</section>
</Drawer>

<style lang="scss">
	.button-box {
		width: 100%;
		margin-top: 10px;
	}

	.wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 8px;

		.banner {
			object-fit: contain;
			width: 100%;
			height: auto;
			border: none;
		}

		.avatar {
			display: inherit;
			flex-direction: row;
			height: 120px;
			border: none;
			justify-content: center;

			img {
				object-fit: contain;
				width: 120px;
				height: 120px;
				border: none;
			}

			.tile {
				display: flex;
				font-size: 120px;
				background: var(--background-l2);
			}
		}

		.buy-tile {
			display: inherit;
			justify-content: center;

			a {
				&:hover {
					text-decoration: underline;
				}
			}
		}

		.hash {
			font-weight: 300;
			margin: 10px 0px;
			margin-right: 10px;
			word-break: break-all;

			label {
				color: var(--text-header);
			}
		}
	}

	h4 {
		margin: 10px 0px;
		margin-right: 10px;
		color: var(--text-header);
	}
	section {
		display: flex;
		flex-direction: column;
		padding: 40px 24px;
		max-width: 650px;
		h2 {
			font-size: 28px;
			color: var(--text-header);
			margin-bottom: 0;
		}
		.textarea-container {
			display: flex;
			flex-direction: column;

			label {
				margin: 10px 0px;
				margin-right: 10px;
				color: var(--text-header);
			}
			textarea {
				border: 1px solid var(--stroke-primary);
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
				border: 1px solid var(--stroke-primary);
				transition: all 0.3s;

				&::placeholder {
					color: var(--text-tertiary);
					font-weight: 300;
				}
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
		}
	}
</style>
