<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import NotificationCard from '$lib/components/NotificationCard.svelte';
	import { markMessageAsRead, userNotificationCenter, type CloudMessage } from '$utils/firestore';

	export let userAddress: string;

	let notifications = userNotificationCenter(userAddress, undefined, {
		field: 'timestamp',
		direction: 'desc',
	});

	const markAsRead =
		({ id }: CloudMessage) =>
		() => {
			return markMessageAsRead(userAddress, id);
		};
</script>

{#if $notifications && $notifications.length > 0}
	<Pagination list={$notifications}>
		<section slot="content" let:listSlice>
			{#each listSlice as notification}
				<NotificationCard {notification} makeRead={markAsRead(notification)} />
			{/each}
		</section>
	</Pagination>
{:else}
	<section>
		<p>You don't have any notifications yet.</p>
	</section>
{/if}

<style lang="scss">
	section {
		margin: 32px 0;
		display: flex;
		flex-direction: column;
		grid-column-gap: 80px;
		grid-row-gap: 32px;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		grid-auto-flow: row;
		grid-auto-rows: 1fr;
	}
</style>
