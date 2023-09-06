<script lang="ts">
	import InfoBox from '$lib/components/InfoBox.svelte';
	import CloseButton from '$lib/components/CloseButton.svelte';

	export let info: string;
	export let classes: string;
	export let display = false;
	export let id = '';

	function closeBox() {
		display = false;
	}
</script>

{#if display}
	<InfoBox {info} {classes} {id}>
		<div slot="action" class="info-close" on:click={closeBox} on:keydown>
			<CloseButton size="0.7rem" position="0" />
		</div>
	</InfoBox>
{/if}

<style lang="scss">
	.info-close {
		position: relative;
		min-width: 16px;
		height: 16px;
	}
</style>
