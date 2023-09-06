<script lang="ts">
	import ActionModal from './ActionModal.svelte';
	import Button from './Button.svelte';

	export let close: () => void;
	export let onSelect: (src: string) => void;

	// There are 13 stickers, but looks nicer with 12... which one to boot?
	const stickers = [
		'banny_blockchain.png',
		'banny_coder.png',
		'banny_dao.png',
		'banny_lfg.png',
		'banny_love.png',
		'banny_party.png',
		'banny_party_2.png',
		'banny_popcorn.png',
		'banny_shoes.png',
		'banny_stoned.png',
		// 'banny_thumbsup.png',
		'banny_wow.png',
		'banny_yes.png',
	];
</script>

<ActionModal title="Attach a sticker">
	<div class="grid">
		{#each stickers as sticker}
			<div class="item">
				<div role="button" on:click={() => onSelect(`/stickers/${sticker}`)} on:keydown>
					<img src="/stickers/{sticker}" alt={`A sticker named ${sticker}`} height="75px" />
				</div>
			</div>
		{/each}
	</div>
	<Button slot="footer" type="secondary" size="md" on:click={close}>Cancel</Button>
</ActionModal>

<style>
	div[role='button'] {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem 0;
		cursor: pointer;
	}

	div[role='button']:hover {
		background-color: var(--background-l2);
	}

	.item {
		display: block;
		flex: 0 0 33%;
		max-width: 33%;
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
	}
</style>
