<script lang="ts">
	import { userdata } from '$utils/firebase';
	import { saveUserFirebase, type User } from '$utils/users/user';
	import { createCustomNotification } from '$utils/notification';
	import { goto } from '$app/navigation';

	import ActionModal from './ActionModal.svelte';
	import Button from './Button.svelte';
	import Checkbox from './Checkbox.svelte';

	export let close: () => void;
	export let collectionId: string;
	export let shortcutToPfp: boolean = false;

	let alwaysNavigate = false;
	const navigate = async () => {
		if (alwaysNavigate && $userdata) {
			const user: User = {
				...$userdata,
				collectionAutoNavigate: true,
			};
			await saveUserFirebase($userdata.uid, user);
		}
		goto(`/collection/${collectionId}?shortcutToPfp=${shortcutToPfp.toString()}`).catch((err) => {
			createCustomNotification({
				type: 'error',
				message: err.message,
				autoDismiss: 3000,
			});
		});
		close();
	};
</script>

<ActionModal title="Collection succesfully created">
	<p>
		You will be sent back to user landing page. To create NFTs for your new collection you will need
		to select this collection from the list or go to the colleciton page. Do you want to go the
		collection page now?
	</p>
	<div class="checkbox">
		<Checkbox bind:checked={alwaysNavigate} />
		Always navigate to collection page
	</div>
	<div slot="footer">
		<Button size="md" type="secondary" on:click={close}>Close</Button>
		<Button size="md" on:click={navigate}>Go to collection</Button>
	</div>
</ActionModal>

<style lang="scss">
	p {
		font-weight: 300;
		color: var(--text-secondary);
	}
	.checkbox {
		display: flex;
		font-weight: 300;
		color: var(--text-secondary);
	}
</style>
