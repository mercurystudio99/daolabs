<script lang="ts">
	import Icon from '$lib/components/Icon';
	import SlideUpInfo from '$lib/components/SlideUpInfo.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { copyToClipboard } from '$utils/clipboard';

	export let handleStartIntroTour: () => void;
	export let openTool: () => void;
	export let openSettings: () => void;
	export let collectionCreator: string;
	export let connectedAccount: string;
</script>

<div class="header-buttons">
	<a href="/user/{collectionCreator}/collections" class="back-icon">
		<Icon name="collectionBack" viewBox="0 0 18 16" />
	</a>
	<div class="settings">
		<Popover
			message="Copy link to clipboard"
			onClick={() => copyToClipboard(window.location.toString())}
		>
			<SlideUpInfo>
				<Icon name="share" viewBox="0 0 30 30" />
			</SlideUpInfo>
		</Popover>
		<Popover message="Guide" onClick={handleStartIntroTour}>
			<Icon name="lifePreserver" width="0.9em" />
		</Popover>
		{#if connectedAccount.toLowerCase() === collectionCreator.toLowerCase()}
			<Popover message="Open tools drawer" onClick={openTool}>
				<Icon name="tool" id="tools" />
			</Popover>
			<Popover message="Open settings drawer" onClick={openSettings}>
				<Icon name="setting" id="settings" />
			</Popover>
		{/if}
	</div>
</div>

<style lang="scss">
	.header-buttons {
		width: 100%;
		height: 1em;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1.3rem;
	}

	.back-icon {
		cursor: pointer;
		color: var(--text-action-primary);
		display: flex;
		align-items: center;
	}
	.settings {
		height: 100%;
		color: var(--text-action-primary);
		cursor: pointer;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		gap: 0.9rem;
	}
</style>
