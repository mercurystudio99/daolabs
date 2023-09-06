<script lang="ts">
	import { formatHistoricalDate } from '$utils/formatDate';
	import ClipboardTooltip from '$lib/components/ClipboardTooltip.svelte';
	import { ipfsCidUrl } from '$utils/ipfs';
	import ActionModal from '../ActionModal.svelte';
	import Button from '../Button.svelte';
	import InfoSpaceBetween from '../InfoSpaceBetween.svelte';
	import { openModal, bind } from '../Modal.svelte';
	import Icon from '../Icon';
	import ViewProjectDocument from './ViewProjectDocument.svelte';
	import type { ProjectTemplate } from '$services/templates';

	export let documents: ProjectTemplate[];
	export let close: () => void;

	function openDocument(index: number) {
		const document = documents[index];
		openModal(
			bind(ViewProjectDocument, {
				markdown: document.markdown,
				title: document.title,
				close: () => {},
			}),
		);
	}
</script>

<ActionModal title="Project documents" width="min-content">
	<article>
		{#each documents as document, index}
			<div class="documentItem" on:click={() => openDocument(index)} on:keydown>
				<InfoSpaceBetween>
					<div slot="left">
						<h4>{document.title}</h4>
						<div class="ipfsCid">
							{document.pinInfo.IpfsHash}
							<a
								target="_blank"
								href={ipfsCidUrl(document.pinInfo.IpfsHash)}
								rel="noopener noreferrer"
							>
								<Icon name="ipfs" style="transition: unset" />
							</a>
							<ClipboardTooltip target={document.pinInfo.IpfsHash} />
						</div>
					</div>
					<div slot="right">
						<p class="timestamp">
							{document.pinInfo.Timestamp &&
								formatHistoricalDate(document.pinInfo.Timestamp * 1000)}
						</p>
					</div>
				</InfoSpaceBetween>
			</div>
		{/each}
	</article>
	<div slot="footer">
		<Button type="secondary" on:click={close}>Close</Button>
	</div>
</ActionModal>

<style>
	article {
		margin-bottom: 40px;
		min-width: 50vw;
	}

	.documentItem {
		padding-top: 10px;
		margin-bottom: 10px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--stroke-tertiary);
		cursor: pointer;
	}

	.ipfsCid {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--text-secondary);
	}

	[slot='footer'] {
		margin-bottom: 16px;
	}

	@media (max-width: 768px) {
		article {
			min-width: 75vw;
		}
	}
</style>
