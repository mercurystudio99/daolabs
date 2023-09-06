<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceIpfsDomain } from '$utils/ipfs';
	import { markdownToHtml } from '$utils/markdown';
	import RichImgPreview, { supportedContentTypes, getContentType } from './RichImgPreview.svelte';
	import type * as CSS from 'csstype';

	export let note: string;
	export let style: CSS.Properties | undefined = undefined;

	type ContentLink = {
		href: string;
		contentType: string;
	};

	let mediaLinks: ContentLink[] = [];
	let sanitizedNote: string | undefined;

	function updateLinks(value: string) {
		const updated = value
			.replace(
				/https[:]\/\/us-central1-juicebox-svelte.cloudfunctions.net\/app\/render\/simple\//g,
				() => 'https://juicebox.wtf/tiles/render/svg/',
			)
			.replace(
				/https[:]\/\/tiles.wtf\/render\/png\//g,
				() => 'https://juicebox.wtf/tiles/render/svg/',
			);
		return updated;
	}

	async function getMediaLinks() {
		if (!note) return [];

		const links: string[] = [];

		note.replace(/(https|http):\/\/[\w./&?,=#-;]+/gi, (link) => {
			links.push(replaceIpfsDomain(link));
			return '';
		});

		const filteredLinks: ContentLink[] = [];
		for (const link of links) {
			let contentType = (await getContentType(link)) as string;
			contentType = contentType?.split(';')?.[0] || '';
			if (supportedContentTypes.includes(contentType)) {
				filteredLinks.push({ href: link, contentType });
			}
		}
		return filteredLinks;
	}

	onMount(async () => {
		note = updateLinks(note);
		mediaLinks = await getMediaLinks();
	});

	function updateMdToHtml() {
		sanitizedNote = markdownToHtml(note);
		for (const link of mediaLinks) {
			sanitizedNote = sanitizedNote.replace(link.href, '');
		}
	}

	$: updateMdToHtml();
</script>

<div>
	<!-- eslint-disable-next-line @ota-meshi/svelte/no-at-html-tags -->
	{@html sanitizedNote}
</div>

<slot />

<div class="images">
	{#each mediaLinks as mediaLink}
		<div class="image">
			<RichImgPreview
				src={mediaLink.href}
				contentType={mediaLink.contentType}
				height="100px"
				{style}
			/>
		</div>
	{/each}
</div>

<style>
	div {
		color: var(--text-secondary);
		font-weight: 300;
	}
	.images {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.image {
		max-height: 100px;
	}
	.image :global(img) {
		max-width: 100%;
		max-height: 100%;
	}
</style>
