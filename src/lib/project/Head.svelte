<script lang="ts">
	import { getContext } from 'svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import Icon from '$lib/components/Icon';
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import Paragraph from '$lib/components/Paragraph.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import ProjectLogo from '$lib/components/ProjectLogo.svelte';
	import { connectedAccount } from '$stores/web3';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import QRCodeIcon from '$lib/components/QRCodeIcon.svelte';
	import { bind, openModal } from '$lib/components/Modal.svelte';
	import Disabled from '$lib/components/Disabled.svelte';
	import blacklist from '$constants/blacklist';
	import ViewProjectDocumentList from '$lib/components/modals/ViewProjectDocumentList.svelte';
	import { checkTwitterVerified } from '$utils/firebase';
	import { browser } from '$app/environment';
	import ProjectConfigurationDrawer from './ProjectConfigurationDrawer.svelte';
	import ToolsDrawer from './ToolsDrawer.svelte';
	import PayableAddressCarouselModal from './PayableAddressCarouselModal.svelte';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';
	import type { ProjectMetadataV6 } from '$models/project-metadata';

	export let loadingMetadata = false;
	export let isBlacklisted: boolean;
	export let twitterVerified = false;

	let drawerShown = false;
	let current: any;
	let stackLayoutBreakpoint = 500;

	const projectContext = getContext<Store<V2ProjectContextType>>('PROJECT');
	let metadata: ProjectMetadataV6 | undefined;
	$: documents = $projectContext.documents;
	$: metadata = $projectContext.projectMetadata;
	$: payableAddresses = $projectContext.events?.filter(
		(event) => event?.deployETHERC20ProjectPayerEvent,
	);
	$: userDeployedPayableAddress = payableAddresses?.findIndex(
		(event) => event?.deployETHERC20ProjectPayerEvent?.caller === $connectedAccount,
	);
	$: isBlacklisted = blacklist.includes($projectContext.projectId?.toNumber() || -1);

	// TODO: contract reader (useHasPermission)
	const showReconfigure = true;

	const prettyUrl = (url: string) => {
		if (url.startsWith('https://')) {
			return url.split('https://')[1];
		}
		if (url.startsWith('http://')) {
			return url.split('http://')[1];
		}
		return url;
	};

	const linkUrl = (url: string) => {
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}
		return `http://${url}`;
	};

	function stack() {
		if (browser) {
			return window?.innerWidth < stackLayoutBreakpoint;
		}
		return false;
	}

	const closeDrawer = () => {
		drawerShown = false;
	};

	function isTwitterVerified() {
		try {
			if (!import.meta.env.VITE_SIGNER_PUBLIC_KEY) {
				console.error('Must set VITE_SIGNER_PUBLIC_KEY environment variable');
			}
			if (metadata.twitter && metadata.twitterSignature) {
				const handle = checkTwitterVerified(metadata.twitter, metadata.twitterSignature);
				if (handle) {
					twitterVerified = true;
				}
			}
		} catch (error) {
			console.error((<Error>error).message);
		}
	}

	$: handle = $projectContext.projectMetadata?.twitter;
	$: handle && isTwitterVerified();
</script>

<section>
	<div class="logo-wrapper">
		<Skeleton loading={loadingMetadata} width="170px" height="170px">
			<ProjectLogo uri={metadata.logoUri} size={170} />
		</Skeleton>
	</div>

	<div class="info-wrapper">
		<InfoSpaceBetween stack={stack()}>
			<h1 slot="left" id="title">
				<Skeleton loading={loadingMetadata} width="320px" height="1.7rem">
					{metadata?.name || 'Untitled project'}
					{#if userDeployedPayableAddress !== -1}
						<div class="qrcode">
							<QRCodeIcon
								showModalOnClick={() => {
									openModal(
										bind(PayableAddressCarouselModal, {
											payableAddresses,
											userDeployedPayableAddress,
										}),
									);
								}}
							/>
						</div>
					{/if}
					{#if isBlacklisted}
						<span style="margin-left: 10px;">
							<Disabled />
						</span>
					{/if}
				</Skeleton>
			</h1>
			<div slot="right" style="display: flex; align-items: center;">
				<span style="color: var(--text-tertiary); padding-right: 10px;">
					<Skeleton loading={loadingMetadata} width="3rem" height="1rem">
						ID:{$projectContext.projectId.toString()}
						<Popover
							message="This project uses the V{$projectContext.version} version of the Juicebox contracts."
						>
							<span class="terminal-version">V{$projectContext.version}</span>
						</Popover>
					</Skeleton>
				</span>
				<div class="clickable-icon">
					<Skeleton loading={loadingMetadata} width="1rem" height="1rem">
						<Icon
							on:click={() => {
								drawerShown = !drawerShown;
								current = ToolsDrawer;
							}}
							name="tool"
						/>
					</Skeleton>
				</div>
				<!-- TODO: projectOwnerAddress doesn't seem to be set -->
				{#if showReconfigure && $projectContext?.projectOwnerAddress && $projectContext?.projectOwnerAddress?.toLowerCase() === $connectedAccount?.toLowerCase()}
					<div class="clickable-icon">
						<Icon
							name="setting"
							on:click={() => {
								drawerShown = !drawerShown;
								current = ProjectConfigurationDrawer;
							}}
						/>
					</div>
				{/if}
			</div>
		</InfoSpaceBetween>
		<div
			style="display: flex; flex-wrap: wrap; padding-top: 8px; padding-bottom: 4px; font-weight: 500;"
		>
			<Skeleton loading={loadingMetadata} width="250px" height="1rem">
				{#if metadata.archived}
					<span class="archived">(ARCHIVED)</span>&nbsp;
				{/if}
				{#if $projectContext.handle}
					<span class="project-handle">
						@{$projectContext.handle}
					</span>
					&nbsp;
				{:else if $connectedAccount && $projectContext.projectOwnerAddress?.toLocaleLowerCase() === $connectedAccount?.toLowerCase()}
					<span
						class="add-handle-btn"
						on:click={() => {
							drawerShown = !drawerShown;
							current = ProjectConfigurationDrawer;
						}}
						on:keydown><Icon name="pen" /> Add handle</span
					>&nbsp;
				{/if}
				{#if metadata?.infoUri}
					<a href={metadata.infoUri} target="_blank" rel="noopener noreferrer"
						>{prettyUrl(metadata.infoUri)}</a
					>
				{/if}
				{#if metadata?.twitter}
					<a
						href={`https://twitter.com/${metadata.twitter}`}
						target="_blank"
						rel="noopener noreferrer"
						><span class="social-icon"><Icon name="twitter" /></span>
						@{metadata.twitter}
						{#if twitterVerified}
							<Popover message="This Twitter account is connected and verified.">
								<span class="verified">✔</span>
							</Popover>
						{/if}
					</a>
				{/if}
				{#if metadata?.discord}
					<a href={linkUrl(metadata.discord)} target="_blank" rel="noopener noreferrer"
						><span class="social-icon"><Icon name="discord" /></span>Discord</a
					>
				{/if}
				{#if documents?.length}
					<div class="documentIcon">
						<span
							class="social-icon"
							on:keydown
							on:click={openModal(
								bind(ViewProjectDocumentList, {
									documents,
									close: () => {},
								}),
							)}
						>
							<Icon name="book" viewBox="64 64 500 500" />
						</span>
					</div>
				{/if}
			</Skeleton>
			<!-- TODO: Projects which are from Juicebox's Directory should have the Juicebox logo, popup to have the JB directory -->
		</div>

		{#if loadingMetadata}
			<Skeleton loading={loadingMetadata} width="100%" height="1rem" />
			<Skeleton loading={loadingMetadata} width="100%" height="1rem" />
			<Skeleton loading={loadingMetadata} width="50%" height="1rem" />
		{:else}
			<Paragraph description={metadata?.description || ''} characterLimit={250} markdown />
		{/if}
	</div>
</section>

<Drawer bind:shown={drawerShown}>
	<svelte:component this={current} close={closeDrawer} />
</Drawer>

<style>
	section {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
	}

	a,
	.documentIcon {
		display: flex;
		align-items: center;
		margin-right: 20px;
		font-weight: 500;
	}

	.documentIcon {
		color: var(--text-tertiary);
		position: relative;
		margin-top: 1px;
		margin-right: 25px;
		cursor: pointer;
	}

	.documentIcon:hover {
		color: var(--accent);
	}

	h1[slot='left'] {
		font-size: 2.4rem;
		line-height: 2.8rem;
		margin: 0px;
		color: var(--text-primary);
	}

	.clickable-icon {
		cursor: pointer;
		color: var(--icon-action-primary);
		margin: 0px 5px;
		font-size: 1rem;
	}
	.clickable-icon:hover {
		color: var(--icon-over-action-primary-highlight);
	}
	.info-wrapper {
		flex: 1 1 0%;
		min-width: 70%;
	}
	.info-wrapper :global(section) {
		align-items: flex-start;
	}

	.social-icon {
		margin-right: 4px;
		display: flex;
	}

	.terminal-version {
		padding: 2px 4px;
		background: var(--background-l1);
		cursor: default;
	}

	.logo-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		height: 120px;
		width: 120px;
		border-radius: 1px;
		margin-right: 1.25rem;
		margin-bottom: 1.25rem;
		/* height: 100%; */
	}

	.archived {
		color: var(--text-secondary);
		opacity: 0.8;
	}

	.add-handle-btn {
		margin-right: 20px;
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--text-action-secondary);
	}

	.add-handle-btn:hover {
		color: var(--accent);
		cursor: pointer;
	}

	.qrcode {
		font-size: 24px;
		--color: var(--text-secondary);
	}

	.verified {
		color: var(--accent);
		margin-left: 4px;
	}

	#title {
		display: flex;
	}

	/* Small screen
	TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] 
	postcss suggestion: @media (--screen-md)
	*/
	@media (max-width: 750px) {
		section {
			margin-top: 60px;
		}
	}

	.project-handle {
		font-weight: bold;
	}
</style>
