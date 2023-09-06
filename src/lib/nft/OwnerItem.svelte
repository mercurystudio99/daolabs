<script lang="ts" context="module">
	export type OwnerInfo = {
		count: number;
		owner: string;
		name: string;
	};
</script>

<script lang="ts">
	import InfoSpaceBetween from '$lib/components/InfoSpaceBetween.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import AddressTooltip from '$lib/components/AddressTooltip.svelte';
	import { getTruncatedAddress } from '$lib/utils/getTruncatedAddress';

	export let owner: OwnerInfo;
</script>

<div class="item">
	<InfoSpaceBetween>
		<div slot="left">
			<div class="user">
				<img
					class="user_image"
					src={ipfsCidUrl('QmNk61dYH1MZB6SjAvkU6o56fHdtYif3muSxce2s7JPXKP')}
					alt="user avatar"
				/>
				<div class="u">
					<div class="name">
						{owner.name || 'Unnamed'}
					</div>
					<p>
						<small>
							<AddressTooltip address={owner.owner} deepdao={null} token={null} ourPlatform={false}>
								{getTruncatedAddress(owner.owner)}
							</AddressTooltip>
						</small>
					</p>
				</div>
			</div>
		</div>
		<div slot="right">
			<p class="timestamp">
				{owner.count}
				{owner.count == 1 ? 'item' : 'items'}
			</p>
		</div>
	</InfoSpaceBetween>
</div>

<style>
	p {
		margin: 0;
	}

	small {
		color: var(--text-tertiary);
		font-weight: 500;
	}
	.name {
		font-weight: 500;
	}

	.timestamp {
		color: var(--text-tertiary);
		font-size: 0.6rem;
		height: 100%;
		display: flex;
		align-items: center;
	}
	.user {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.user_image {
		margin-right: 1rem;
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
	}
	.u {
		display: flex;
		flex-direction: column;
	}
	:global(.timestamp .link) {
		color: var(--text-tertiary);
	}

	.item {
		padding-top: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--stroke-tertiary);
	}
</style>
