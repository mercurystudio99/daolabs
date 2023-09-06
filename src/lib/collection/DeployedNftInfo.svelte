<script>
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { isCurrentUserSpaceCadet } from '$utils/users/user';
</script>

<InfoBox>
	<p>
		This collection is deployed, if you want to deploy it again; use the <b>Export</b> functionality
		and create a new collection from the downloaded json.
	</p>
</InfoBox>
<div class="slot-wrapper">
	<slot />
</div>
{#if isCurrentUserSpaceCadet()}
	<InfoBox>
		<p>
			<b>You are a DAOLABS spacecadet</b>, you can push assets again and deploy a replacement
			contract for this collection.
		</p>
	</InfoBox>
{/if}

<style>
	.slot-wrapper {
		margin: 1rem 0 1rem 0;
	}
</style>
