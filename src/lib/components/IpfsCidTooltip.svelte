<script lang="ts">
	import { ipfsCidUrl } from '$utils/ipfs';
	import ClipboardTooltip from '$lib/components/ClipboardTooltip.svelte';
	import Icon from '$lib/components/Icon';
	import Popover from '$lib/components/Popover.svelte';

	export let cid: string;
</script>

<Popover maxWidth="220">
	<div slot="content">
		<p>
			{cid}
			<a target="_blank" href={ipfsCidUrl(cid)} rel="noopener noreferrer">
				<Icon name="ipfs" style="transition: unset" />
			</a>
			<ClipboardTooltip target={cid} />
		</p>
	</div>
	<Icon name="ipfs" style="transform: translateY(2px); color: var(--icon-action-primary)" />
</Popover>

<style>
	div[slot='content'] {
		width: 220px;
	}
	p {
		font-size: 12px;
		word-break: break-all;
	}
	a {
		color: var(--text-primary);
	}
</style>
