<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import HeavyBorderBox from '$lib/components/HeavyBorderBox.svelte';
	import { openModal } from '$lib/components/Modal.svelte';
	import UserToolModal from './UserToolModal.svelte';

	export let shown: boolean;

	const openTool = () => {
		openModal(UserToolModal);
	};
</script>

<Drawer bind:shown>
	<section>
		<h2>User tool</h2>
		<HeavyBorderBox>
			<h4>Placeholder title</h4>
			<p>Placeholder text</p>
			<Button size="md" type="tertiary" on:click={openTool}>Open tool</Button>
		</HeavyBorderBox>
	</section>
</Drawer>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		padding: 40px 26px;
		max-width: 650px;
		h2 {
			font-size: 28px;
			color: var(--text-header);
		}

		p {
			font-size: 300;
			color: var(--text-secondary);
		}

		h4 {
			font-size: 16px;
			font-weight: 400;
			color: var(--text-header);
		}
	}
</style>
