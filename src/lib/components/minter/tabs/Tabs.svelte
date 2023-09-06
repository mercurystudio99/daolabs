<script>
	// TODO: Didn't find any places where is it used so I just disabled no-unsafe-assignment errors here. Maybe need to remove it?

	import Icon from '$lib/components/Icon';
	import { connectedAccount } from '$stores/web3';

	export let items = {};
	export let activeTabValue = 1;

	const handleClick = (tabValue) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		activeTabValue = tabValue;
	};
	const handleEvent = (event) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		activeTabValue = event.detail.tabValue;
	};

	const openSettings = () => {};
</script>

<div class="header-tabs">
	{#each items as item}
		<button class:active={activeTabValue === item.value} on:click={() => handleClick(item.value)}>
			<span>{item.value}. {item.label}</span>
		</button>
	{/each}
	{#if $connectedAccount}
		<div class="clickable-icon">
			<Icon on:click={openSettings} name="setting" />
		</div>
	{/if}
</div>
{#each items as item}
	{#if activeTabValue == item.value}
		<div class="box">
			<svelte:component this={item.component} on:goToTab={handleEvent} />
		</div>
	{/if}
{/each}

<style lang="scss">
	.header-tabs {
		border-bottom: 1px solid var(--text-disabled);
		overflow-x: scroll;
		max-width: 1120px;
		position: relative;
		&::-webkit-scrollbar {
			display: none;
		}
		button {
			background: none;
			border: none;
			font-size: 18px;
			font-weight: 300;
			border-radius: 0;
			margin: 0;
			color: var(--secondary-text);
			padding-bottom: 20px;
			padding-right: 40px;
			position: relative;
		}
		button.active {
			color: var(--text-brand-primary);
			font-weight: 500;
		}

		button.active:after {
			position: absolute;
			content: ' ';
			height: 2px;
			bottom: 0px;
			margin: 0 auto;
			left: 0;
			right: 0;
			background: var(--text-brand-primary);
		}
		.clickable-icon {
			cursor: pointer;
			color: var(--icon-action-primary);
			font-size: 1rem;
			position: absolute;
			top: 0;
			right: 0;
			display: flex;

			&:hover {
				color: var(--icon-over-action-highlight);
			}
		}
	}

	.box {
		max-width: 1120px;
		margin-top: 40px;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 900px) {
		button {
			padding-right: unset;
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 650px) {
		button {
			padding-bottom: 5px;
		}
		button.active:after {
			background: none;
		}
	}
</style>
