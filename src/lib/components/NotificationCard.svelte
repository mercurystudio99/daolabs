<script lang="ts">
	import Icon from './Icon';
	import type { CloudMessage } from '$utils/firestore';

	export let notification: CloudMessage;
	export let makeRead: () => Promise<void>;

	let expanded = false;

	$: unread = !notification.readAt || notification.readAt === 0;
</script>

<div class="notification" class:unread on:click={makeRead} on:keydown>
	<div class="row">
		<span class="expandable" on:click={() => (expanded = !expanded)} on:keydown>
			<Icon name={expanded ? 'chevronDown' : 'chevronRight'} />
			{notification.title}
		</span>
	</div>
	<div class="row">
		<span class:truncate={!expanded}>{notification.message}</span>
	</div>
	{#if expanded && notification?.link}
		<div class="row right">
			<a href={notification.link} target="_blank" rel="noopener noreferrer">Learn more</a>
		</div>
	{/if}
</div>

<style lang="scss">
	.notification {
		padding: 16px 32px;
		display: flex;
		flex-direction: column;
		border: 0.4px solid var(--stroke-tertiary);
		gap: 4px;
		position: relative;

		&:hover {
			border: 0.4px solid var(--stroke-secondary);
		}

		.row {
			display: flex;
			justify-content: space-between;
			gap: 8px;

			span {
				display: flex;
				gap: 8px;
				font-size: 14px;
				align-items: center;
			}

			.expandable {
				cursor: pointer;
				flex-wrap: nowrap;
			}
		}

		.right {
			justify-content: flex-end;
		}

		.truncate {
			overflow: hidden;
			text-overflow: fade;
			white-space: nowrap;
		}
	}

	.unread {
		border: 0.4px solid var(--stroke-action-primary);

		&:hover {
			border: 0.4px solid var(--stroke-action-primary);
		}
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		.notification {
			padding: 8px 16px;
		}

		.notification > .row {
			flex-wrap: wrap;
		}
	}
</style>
