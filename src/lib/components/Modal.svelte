<!--
Borrowed from https://svelte.dev/repl/033e824fad0a4e34907666e7196caec4?version=3.20.1
with minor utility function addons.
Date: 2022-05-01
v1.3.0
-->
<script lang="ts" context="module">
	import { modal as globalModal, modalOptions as globalModalOptions } from '$stores';
	import type {
		ComponentConstructorOptions,
		ComponentProps,
		ComponentType,
		SvelteComponentTyped,
	} from 'svelte';
	import type Store from '$utils/Store';
	/**
	 * Create a Svelte component with props bound to it.
	 * @example modal.set(bind(AddSplitModal, { message: "Hello" }));
	 */
	export function bind<T = any>(
		Component: ComponentType<SvelteComponentTyped<T>>,
		props?: ComponentProps<SvelteComponentTyped<T>>,
	): (options: ComponentConstructorOptions<T>) => SvelteComponentTyped {
		const NewComponent = function ModalComponent(
			options: ComponentConstructorOptions<T>,
		): SvelteComponentTyped {
			// set name of self to passed in Component name
			self.name = Component.name;
			return new Component({
				...options,
				props: { ...props, ...options.props },
			});
		};
		Object.defineProperty(NewComponent, 'name', { value: Component.name });
		// NewComponent.name = Component.name;
		return NewComponent;
	}

	/**
	 * Open modal
	 * @type {(component: Component, options: Record<string, any>) => Component}
	 */
	export function openModal(
		component: (options: ComponentConstructorOptions) => SvelteComponentTyped,
		options?: any,
		modal: Store<ModalType> = globalModal,
		modalOptions = globalModalOptions,
	): void {
		modal.set(component);
		modalOptions.set(options);
	}

	/**
	 * Open modal
	 * @type {component: Component => void}
	 */
	export function closeModal(modal = globalModal) {
		modal.set(null);
	}

	export type ModalType = ReturnType<typeof bind>;
	export type ModalProps = ComponentProps<SvelteComponentTyped<any>>;
</script>

<script lang="ts">
	import { onDestroy, onMount, setContext as baseSetContext, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/Icon';
	import CloseButton from './CloseButton.svelte';

	const dispatch = createEventDispatcher();

	/**
	 * Svelte component to be shown as the modal
	 * @type {Component | null}
	 */
	export let show: ComponentType | ModalType = null;

	/**
	 * Svelte store with component to properly handle closing
	 * @type {Store<ModalType>}
	 */
	export let modal: Store<ModalType> = globalModal;

	/**
	 * Svelte context key to reference the simple modal context
	 * @type {string}
	 */
	export let key = 'MODAL';

	/**
	 * Accessibility label of the modal
	 * @see https://www.w3.org/TR/wai-aria-1.1/#aria-label
	 * @type {string | null}
	 */
	export let ariaLabel = null;

	/**
	 * Element ID holding the accessibility label of the modal
	 * @see https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby
	 * @type {string | null}
	 */
	export let ariaLabelledBy = null;

	/**
	 * Whether to show a close button or not
	 * @type {Component | boolean}
	 */
	export let closeButton = true;

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

	/**
	 * Whether to close the modal on hitting the escape key or not
	 * @type {boolean}
	 */
	export let closeOnEsc = true;

	/**
	 * Whether to close the modal upon an outside mouse click or not
	 * @type {boolean}
	 */
	export let closeOnOuterClick = true;

	/**
	 * CSS for styling the background element
	 * @type {Record<string, string | number>}
	 */
	export let styleBg = {};

	/**
	 * CSS for styling the window wrapper element
	 * @type {Record<string, string | number>}
	 */
	export let styleWindowWrap = {};

	/**
	 * CSS for styling the window element
	 * @type {Record<string, string | number>}
	 */
	export let styleWindow = {};

	/**
	 * CSS for styling the content element
	 * @type {Record<string, string | number>}
	 */
	export let styleContent = {};
	/**
	 * CSS for styling the inner content element
	 * @type {Record<string, string | number>}
	 */
	export let styleInnerContent = {};

	/**
	 * CSS for styling the close element
	 * @type {Record<string, string | number>}
	 */
	export let styleCloseButton = {};

	/**
	 * Class name for the background element
	 * @type {string | null}
	 */
	export let classBg = null;

	/**
	 * Class name for window wrapper element
	 * @type {string | null}
	 */
	export let classWindowWrap = null;

	/**
	 * Class name for window element
	 * @type {string | null}
	 */
	export let classWindow = null;

	/**
	 * Class name for content element
	 * @type {string | null}
	 */
	export let classContent = null;

	/**
	 * Class name for close element
	 * @type {string | null}
	 */
	export let classCloseButton = null;

	/**
	 * Do not apply default styles to the modal
	 * @type {boolean}
	 */
	export let unstyled = false;

	/**
	 * @type {(key: any, context: any) => void}
	 */
	export let setContext = baseSetContext;

	/**
	 * Transition function for the background element
	 * @see https://svelte.dev/docs#transition_fn
	 * @type {(node: Element, parameters: BlurParams) => TransitionConfig}
	 */
	export let transitionBg = fade;

	/**
	 * Parameters for the background element transition
	 * @type {BlurParams}
	 */
	export let transitionBgProps = { duration: 250 };

	/**
	 * Transition function for the window element
	 * @see https://svelte.dev/docs#transition_fn
	 * @type {(node: Element, parameters: BlurParams) => TransitionConfig}
	 */
	export let transitionWindow = transitionBg;

	/**
	 * Parameters for the window element transition
	 * @type {BlurParams}
	 */
	export let transitionWindowProps = transitionBgProps;

	/**
	 * If `true` elements outside the modal can be focused
	 * @type {boolean}
	 */
	export let disableFocusTrap = false;

	/**
	 * If true the modal can be expanded to fullscreen
	 * @type {boolean}
	 */
	export let fullscreen = false;

	/**
	 * If true the modal should fullscreen by default
	 * @type {boolean}
	 */
	export let fullscreenDefault = false;

	/**
	 * If true the modal disables scorll on body
	 * @type {boolean}
	 */
	export let disableBodyScroll = true;

	$: fullscreenEnabled = fullscreen && (fullscreenDefault || window.innerWidth < 500);

	$: defaultState = {
		ariaLabel,
		ariaLabelledBy,
		helpButton,
		closeButton,
		closeOnEsc,
		closeOnOuterClick,
		styleBg,
		styleWindowWrap,
		styleWindow,
		styleContent,
		styleInnerContent,
		styleCloseButton,
		classBg,
		classWindowWrap,
		classWindow,
		classContent,
		classCloseButton,
		transitionBg,
		transitionBgProps,
		transitionWindow,
		transitionWindowProps,
		disableFocusTrap,
		unstyled,
		fullscreen,
	};
	let state = { ...defaultState };

	let Component = null;

	let background;
	let wrap;
	let modalWindow;
	let scrollY: number;
	let cssBg;
	let cssWindowWrap;
	let cssWindow;
	let cssContent;
	let cssInnerContent;
	let cssCloseButton;
	let currentTransitionBg;
	let currentTransitionWindow;
	let prevBodyWidth;
	let outerClickTarget;

	const camelCaseToDash = (str: string) => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

	const toCssString = (props) =>
		props
			? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			  Object.keys(props).reduce(
					(str, k) => `${str}; ${camelCaseToDash(k)}: ${String(props[k])}`,
					'',
			  )
			: '';

	const isFunction = (f) => !!(f && f.constructor && f.call && f.apply);

	const updateStyleTransition = () => {
		cssBg = toCssString({
			width: window.innerWidth,
			height: window.innerHeight,
			...state.styleBg,
		});
		cssWindowWrap = toCssString(state.styleWindowWrap);
		cssWindow = toCssString(state.styleWindow);
		cssContent = toCssString(state.styleContent);
		cssInnerContent = toCssString(state.styleInnerContent);
		cssCloseButton = toCssString(state.styleCloseButton);
		currentTransitionBg = state.transitionBg;
		currentTransitionWindow = state.transitionWindow;
	};

	type ModalCallback = {
		onOpen: (event: Event) => void;
		onClose: (event: Event) => void;
		onOpened: (event: Event) => void;
		onClosed: (event: Event) => void;
	};

	const defaultModalCallback: ModalCallback = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onOpen: (e: Event) => {},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onClose: (e: Event) => {},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onOpened: (e: Event) => {},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onClosed: (e: Event) => {},
	};

	let { onOpen, onClose, onOpened, onClosed } = defaultModalCallback;

	const disableScroll = () => {
		scrollY = window.scrollY;
		prevBodyWidth = document.body.style.width;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${String(scrollY)}px`;
		document.body.style.overflow = 'hidden';
		document.body.style.width = '100%';
	};

	const enableScroll = () => {
		// NOTE we're not using `prevBodyPosition` here because
		// we have a couple of nested modals, so the previous
		// state can be fixed and overflow hidden. Fix this
		// in the future, for now just unset.
		document.body.style.position = '';
		document.body.style.overflow = '';
		document.body.style.top = '';
		document.body.style.width = prevBodyWidth || '';
		// @ts-ignore, it is assignable
		window.scrollTo({ top: scrollY, behavior: 'instant' });
	};

	const close = (callback: ModalCallback = defaultModalCallback) => {
		if (!Component) return;
		if ($modal?.name === Component.name) modal.set(null);
		onClose = callback.onClose || onClose;
		onClosed = callback.onClosed || onClosed;
		Component = null;
		fullscreenEnabled = false;
		if (disableBodyScroll) {
			enableScroll();
		}
	};

	const closeHandler = () => {
		close();
	};

	const open = (
		NewComponent: ComponentType,
		newProps = {},
		options = {},
		callback: ModalCallback = defaultModalCallback,
	) => {
		Component = bind(NewComponent, { ...newProps, close });
		state = { ...defaultState, ...options };
		updateStyleTransition();
		if (disableBodyScroll) {
			disableScroll();
		}
		onOpen = (event: Event) => {
			if (callback.onOpen) callback.onOpen(event);
			/**
			 * The open event is fired right before the modal opens
			 * @event {void} open
			 */
			dispatch('open');
			/**
			 * The opening event is fired right before the modal opens
			 * @event {void} opening
			 * @deprecated Listen to the `open` event instead
			 */
			dispatch('opening'); // Deprecated. Do not use!
		};
		onClose = (event: Event) => {
			if (callback.onClose) callback.onClose(event);
			/**
			 * The close event is fired right before the modal closes
			 * @event {void} close
			 */
			dispatch('close');
			/**
			 * The closing event is fired right before the modal closes
			 * @event {void} closing
			 * @deprecated Listen to the `close` event instead
			 */
			dispatch('closing'); // Deprecated. Do not use!
		};
		onOpened = (event) => {
			if (callback.onOpened) callback.onOpened(event);
			/**
			 * The opened event is fired after the modal's opening transition
			 * @event {void} opened
			 */
			dispatch('opened');
		};
		onClosed = (event) => {
			if (callback.onClosed) callback.onClosed(event);
			/**
			 * The closed event is fired after the modal's closing transition
			 * @event {void} closed
			 */
			dispatch('closed');
		};
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (state.closeOnEsc && Component && event.key === 'Escape') {
			event.preventDefault();
			close();
		}

		if (Component && event.key === 'Tab' && !state.disableFocusTrap) {
			// trap focus
			const nodes: HTMLElement[] = modalWindow.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement as HTMLElement);
			if (index === -1 && event.shiftKey) index = 0;

			index += tabbable.length + (event.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			event.preventDefault();
		}
	};

	const handleOuterMousedown = (event: MouseEvent) => {
		if (state.closeOnOuterClick && (event.target === background || event.target === wrap))
			outerClickTarget = event.target;
	};

	const handleOuterMouseup = (event: MouseEvent) => {
		if (state.closeOnOuterClick && event.target === outerClickTarget) {
			event.preventDefault();
			close();
		}
	};

	setContext(key, { open, close });

	let isMounted = false;

	$: {
		if (isMounted) {
			if (isFunction(show)) {
				// NOTE! Cannot use void here to avoid type error
				open(show);
			} else {
				close();
			}
		}
	}

	onDestroy(() => {
		if (isMounted) close();
	});

	onMount(() => {
		isMounted = true;
	});
</script>

<svelte:window on:keydown={handleKeydown} />
<!-- eslint-disable -->
{#if Component}
	<div
		class={state.classBg}
		class:bg={!unstyled}
		on:mousedown={handleOuterMousedown}
		on:mouseup={handleOuterMouseup}
		bind:this={background}
		transition:currentTransitionBg={state.transitionBgProps}
		style={cssBg}
	>
		<div
			class={state.classWindowWrap}
			class:wrap={!unstyled}
			class:fullscreen={fullscreenEnabled}
			bind:this={wrap}
			style={cssWindowWrap}
		>
			<div
				class={state.classWindow}
				class:window={!unstyled}
				class:fullscreen={fullscreenEnabled}
				role="dialog"
				aria-modal="true"
				aria-label={state.ariaLabelledBy ? null : state.ariaLabel || null}
				aria-labelledby={state.ariaLabelledBy || null}
				bind:this={modalWindow}
				transition:currentTransitionWindow={state.transitionWindowProps}
				on:introstart={onOpen}
				on:outrostart={onClose}
				on:introend={onOpened}
				on:outroend={onClosed}
				style={cssWindow}
			>
				{#if state.fullscreen}
					<span
						class="icon"
						role="button"
						style="right: {state.helpButton ? '5rem' : '3rem'}"
						on:click={() => {
							fullscreenEnabled = !fullscreenEnabled;
						}}
						on:keydown
					>
						<Icon
							name={fullscreenEnabled ? 'minimize' : 'maximize'}
							style="margin: 2px; stroke-width: 1.3;"
						/>
					</span>
				{/if}
				{#if state.helpButton}
					<span class="help-icon" role="button" on:click={handleStartIntro} on:keydown>
						<Icon name="lifePreserver" style="width:1.5rem height:1.5rem" />
					</span>
				{/if}
				{#if state.closeButton}
					{#if isFunction(state.closeButton)}
						<svelte:component this={state.closeButton} onClose={close} />
					{:else if unstyled}
						<div
							role="button"
							class={state.classCloseButton}
							aria-label="Close modal"
							on:click={closeHandler}
							style={cssCloseButton}
							on:keydown
						/>
					{:else}
						<CloseButton on:click={closeHandler} />
					{/if}
				{/if}
				<div class={state.classContent} class:content={!unstyled} style={cssContent}>
					<div class:inner-content={!unstyled} style={cssInnerContent}>
						<svelte:component this={Component} />
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
<slot />

<style>
	* {
		box-sizing: border-box;
	}

	.bg {
		position: fixed;
		z-index: 1000;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.66);
	}

	.icon {
		position: absolute;
		top: 1rem;
		/* To account for the close button */
		font-size: 1.3rem;
		z-index: 1000;
		line-height: 0;
	}

	.help-icon {
		position: absolute;
		top: 1rem;
		right: 3rem;
		width: 1.5rem;
		height: 1.5rem;
		z-index: 1000;
		line-height: 0;
		display: flex;
		flex-direction: row;

		align-items: center;
		justify-content: center;
	}

	@media (hover: hover) and (pointer: fine) {
		.icon:hover {
			cursor: pointer;
			color: white;
			background: var(--icon-action-primary);
		}

		.help-icon:hover {
			cursor: pointer;
			color: white;
			background: var(--icon-action-primary);
		}
	}

	.wrap {
		position: relative;
		max-height: 100%;
	}

	.window {
		position: relative;
		width: fit-content;
		max-width: 100%;
		max-height: 100%;
		margin: 2rem auto;
		background: var(--background-l0);
		border-radius: var(--radius-xl)
	}

	.content {
		display: block;
		position: relative;
		max-height: calc(100vh - 4rem);
		padding: 3rem 1rem 2rem;
		overflow: auto;
		display: flex;
		justify-content: center;
	}

	/* Fullscreen */
	.fullscreen {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		width: 100vw;
		height: 100vh;
		margin: 0;
	}

	.wrap.fullscreen {
		position: unset;
		margin: 0;
	}
	.fullscreen > .content,
	.fullscreen > .content > .inner-content {
		max-height: 100vh;
	}

	.fullscreen > .content > .inner-content {
		width: 100vw;
	}

	/* target children of inner-content */
	:global(.fullscreen > .content > .inner-content > *) {
		margin: 0 auto;
	}
</style>
