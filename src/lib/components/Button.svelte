<script lang="ts" context="module">
	export enum ButtonType {
		PRIMARY = 'primary',
		SECONDARY = 'secondary',
		TERTIARY = 'tertiary',
		DANGER = 'danger',
		SUCCESS = 'success',
		WARNING = 'warning',
		INFO = 'info',
		LIGHT = 'light',
		LINK = 'link',
		DARK = 'dark',
	}

	// TODO: do fancy typescript thing to get values of enum
	// tried ButtonType[keyof typeof ButtonType];
	type UnionButtonType =
		| 'primary'
		| 'secondary'
		| 'tertiary'
		| 'danger'
		| 'success'
		| 'warning'
		| 'info'
		| 'light'
		| 'link'
		| 'dark';
</script>

<script lang="ts">
	import Icon from '$lib/components/Icon';

	export let disabled = false;
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
	export let type: ButtonType | UnionButtonType = ButtonType.PRIMARY;
	export let loading = false;

	export let buttonProps: any = {};
	export let fullWidth = false;
	export let fullWidthMobile = false;
</script>

<button
	class={`${size} ${type}`}
	class:fullWidth
	class:fullWidthMobile
	disabled={disabled || loading}
	{...buttonProps}
	on:click
	><slot />
	{#if loading}
		<Icon name="loading" spin />
	{/if}
</button>

<style>
	button {
		background: var(--accent);
		border-color: transparent;
		/* box-shadow: 0 6px 10px rgba(19, 13, 13, 0.08); */
		border-radius: var(--radius-md);
		color: var(--text-over-action-primary);
		font-weight: 500;
		font-size: 16px;
		cursor: pointer;
	}
	button[disabled] {
		background: var(--background-disabled);
		border-color: var(--stroke-disabled);
		color: var(--text-disabled);
		cursor: not-allowed;
	}

	.fullWidth {
		width: 100%;
	}

	.sm {
		min-height: 26px;
		font-size: 0.7rem;
		padding: 0px 10px;
		margin-top: 0;
	}

	.md {
		min-height: 32px;
		font-size: 14px;
		font-weight: 500;
		padding: 0px 16px;
		margin-top: 0;
	}

	.lg {
		min-height: 36px;
		padding: 2px 15px;
	}

	.secondary {
		background: transparent;
		color: var(--accent);
		border: 1px solid var(--accent);
	}

	.secondary:hover {
		color: var(--background-action-primary);
		border: 1px solid var(--background-action-primary);
		transition: all 0.5s ease-in-out;
	}

	.secondary:disabled {
		background: transparent;
		border: 1px solid var(--stroke-disabled);
	}

	.tertiary {
		background: transparent;
		color: var(--text-secondary);
		box-shadow: unset;
		border: 1px dashed var(--stroke-tertiary);
		font-weight: 400;
		width: 100%;
	}

	.tertiary:hover {
		border: 1px dashed var(--accent);
		box-shadow: unset;
		color: var(--accent);
	}
	.link {
		border: none;
		background: transparent;
		box-shadow: unset;
		margin: 0;
		display: inline;
		height: unset;
		padding: unset;
		color: var(--text-action-secondary);
		font-size: inherit;
	}

	.link:hover {
		color: var(--text-action-highlight);
		box-shadow: none;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 767px) {
		.fullWidthMobile {
			width: 100%;
		}
	}
</style>
