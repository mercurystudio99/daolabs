<script lang="ts">
	import { setContext } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import Store from '$utils/Store';
	import Icon from '$lib/components/Icon';
	import { browser } from '$app/environment';
	import CloseButton from './CloseButton.svelte';
	import Modal, { bind } from './Modal.svelte';
	import UnsavedChangesModal from './UnsavedChangesModal.svelte';

	// NOTE this is a bit back to front, ideally I'd like the outer on:click to be intercepted
	// at Drawer inner component level to check if dirty _once_, and not continuesly on each update.
	const showDirty = new Store(false);
	setContext('SHOW_DIRTY', {
		showDirty,
		check: (initialState: { [x: string]: any } = {}, currentState: { [x: string]: any } = {}) => {
			// For each key in initialState, check if any value is different
			// from the values in currentState. Short-circuit if any value is different.
			$showDirty = Object.keys(initialState).some((key) => initialState[key] !== currentState[key]);
		},
	});

	/**
	 * Whether to show a help button or not
	 * @type {boolean}
	 */
	export let helpButton = false;

	/**
	 * Whether to show a help button or not
	 * @type {() => void}
	 */
	export let handleStartIntro = () => {};

	export let shown = false;
	export let disableBodyScroll = true;
	// NOTE: I checked Drawer usage and did not find any place where this is set.
	// I guess it function, so set a type and default value to avoid errors here and in the places where it used
	export let closeFunction: () => void = null;
	let modal: any;

	function close() {
		// Reset the dirty state
		showDirty.set(false);
		shown = false;
		modal = undefined;
	}

	function checkDirty() {
		if ($showDirty) {
			modal = bind(UnsavedChangesModal, {
				closeResource: closeFunction ?? close,
			});
		} else {
			closeFunction ? closeFunction() : close();
		}
	}

	const disableScroll = () => {
		if (browser) {
			document.body.style.overflow = 'hidden';
		}
	};

	const enableScroll = () => {
		if (browser) {
			document.body.style.overflow = '';
		}
	};

	$: {
		if (disableBodyScroll) {
			if (shown) {
				disableScroll();
			} else {
				enableScroll();
			}
		}
	}
</script>

{#if shown}
	<!-- The element that makes the whole page besides drawer darkish  -->
	<div class="overlay" in:fade={{ duration: 100 }} out:fade on:click={checkDirty} on:keydown />

	<div class="drawer-container" in:fly={{ x: 120 }} out:fly={{ x: 120 }}>
		<div class="buttons">
			{#if helpButton}
				<span class="help-icon" on:click={handleStartIntro} on:keydown>
					<Icon name="lifePreserver" />
				</span>
			{/if}
			<CloseButton on:click={checkDirty} position="0" size="1rem" />
		</div>
		<slot {close} />
	</div>
{/if}
<Modal show={modal} closeButton={false} disableBodyScroll={false} />

<style>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	.drawer-container {
		overflow: auto;
		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		background-color: var(--background-l0);
		z-index: 1000;
		width: 640px;
		height: 100%;
	}
	.buttons {
		position: absolute;
		width: 3.5rem;
		right: 1rem;
		top: 1rem;
		height: 1.5rem;
		display: flex;
		z-index: 1000;
	}
	.help-icon {
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.help-icon:hover {
		cursor: pointer;
		color: white;
		background: var(--icon-action-primary);
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 640px) {
		.drawer-container {
			width: 100%;
		}
	}
</style>
