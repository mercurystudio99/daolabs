<script lang="ts">
	import Button from './Button.svelte';

	export let click;
	// NOTE: this is here to not show the unknown prop in console
	export const close = () => {};
</script>

<main>
	<h2>Attention</h2>
	<p>
		The <a href="https://github.com/DAOLABS-WTF/daolabs-contracts" target="_blank" rel="noreferrer"
			>Movement</a
		>
		(or <a href="https://juicebox.money/" target="_blank" rel="noreferrer">Juicebox</a> smart-contracts,
		from which, in part, Movement forked) may be vulnerable to bugs or hacks. All cryptocurrency or crypto-assets
		(funds) moved through the Treasury contracts could be lost or stolen. Movement, DAOLABS, its contributors,
		developers, and affiliates are not liable for any and all losses by any Treasury, its owners, contributors
		or supporters.
	</p>
	<p>
		By clicking the "I understand" button, you acknowledge and agree that you have read and
		understood the DAO's <a
			href="https://move.xyz/terms-of-service"
			target="_blank"
			rel="noreferrer">Terms of Service</a
		>.
	</p>
	<br />
	<div class="buttons">
		<Button type="primary" on:click|once={click}>I understand</Button>
	</div>
</main>

<style>
	h2 {
		color: var(--text-header);
	}
	main {
		max-width: 350px;
	}
	.buttons {
		display: flex;
		justify-content: flex-end;
	}
</style>
