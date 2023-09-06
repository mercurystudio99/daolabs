<script lang="ts">
	import { computePosition, autoPlacement } from '@floating-ui/dom';
	import { onMount } from 'svelte';
	import clickOutsideDirective from '$utils/clickOutside';

	export let message: string = '';
	export let placement: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
	export let maxWidth = '200px';
	export let minWidth = '50px';
	export let nowrap = false;
	export let hide = false;
	export let onClick: () => void = null;

	let wrapperRef: HTMLElement;
	let popoverRef: HTMLElement;
	let isHovered = false;

	function setPosition() {
		computePosition(wrapperRef, popoverRef, {
			middleware: [autoPlacement()],
			placement,
		})
			.then((result) => {
				Object.assign(popoverRef.style, {
					position: result.strategy,
					left: `${result.x}px`,
					top: `${result.y}px`,
				});
			})
			.catch((e) => console.log(e));
	}

	function mouseOver() {
		isHovered = true;
		setPosition();
	}

	function setMouseTouchListeners() {
		wrapperRef.addEventListener('mouseenter', mouseOver);
		wrapperRef.addEventListener('touchstart', mouseOver);
	}

	function removeMouseTouchListeners() {
		wrapperRef.removeEventListener('mouseenter', mouseOver);
		wrapperRef.removeEventListener('touchstart', mouseOver);
	}

	function mouseLeave() {
		isHovered = false;
		removeMouseTouchListeners();
		setMouseTouchListeners();
	}

	const handleClick = () => {
		if (onClick) {
			onClick();
			isHovered = false;
			removeMouseTouchListeners();
		}
	};

	onMount(() => {
		setMouseTouchListeners();
	});
	$: style = `--maxWidth: ${maxWidth}; --minWidth: ${minWidth};`;
</script>

<span
	id="wrapper"
	bind:this={wrapperRef}
	on:click|stopPropagation={handleClick}
	on:focus
	on:keydown
	on:mouseleave={mouseLeave}
	on:touchstart={mouseOver}
	use:clickOutsideDirective
	on:clickOutside={mouseLeave}
>
	<slot />
	<div
		bind:this={popoverRef}
		{style}
		id="popover"
		class:hidden={!isHovered || hide}
		class="popover"
	>
		<slot name="content" />
		{#if message}
			<p class="message" class:nowrap>{@html message}</p>
		{/if}
	</div>
</span>

<style>
	.message {
		font-weight: 300;
		font-size: 12px;
		color: var(--text-primary);
		line-height: 1.2;
		margin: 0;
		text-align: left;
		text-transform: none;
	}
	.popover {
		left: 0;
		top: 0;
		position: absolute;
		left: 0;
		top: 0;
		max-width: var(--maxWidth);
		background: var(--background-l0);
		box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
		transition: visibility 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97);
		padding: 10px;
		z-index: 999;
		white-space: normal;
		text-transform: none;
	}
	.nowrap {
		white-space: nowrap;
	}
	.hidden {
		display: none;
	}
</style>
