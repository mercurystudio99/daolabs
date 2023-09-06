<script lang="ts">
	import { getLinkIconProps, type IconProp } from '$utils/links';
	import Icon from '$lib/components/Icon';

	type IconData = {
		label: string;
		href: string;
		iconProps: IconProp;
	};

	export let links: string[] = [];
	export let stripHandle = true;
	let data: IconData[] = [];

	function prettifyHandle(link: string) {
		const lastSlash = link.lastIndexOf('/');
		return lastSlash === -1 ? link : link.substring(lastSlash + 1);
	}

	function prettifyLink(link: string) {
		return link.match(/^(https?:\/\/)?(.+)$/)[2];
	}

	function getLabel(link: string, iconName: string) {
		if (iconName !== 'globe') {
			if (stripHandle) {
				return '';
			}
			return prettifyHandle(link);
		}
		return prettifyLink(link);
	}

	function prepareLinks(linksToPrepare: string[]) {
		let linksData: IconData[] = [];
		for (let i = 0; i < links.length; i++) {
			const iconProps = getLinkIconProps(linksToPrepare[i]);
			// add https:// if no protocol is specified
			const href = linksToPrepare[i].match(/^(https?:\/\/)/)
				? linksToPrepare[i]
				: `https://${linksToPrepare[i]}`;
			linksData = [
				...linksData,
				{
					iconProps,
					label: getLabel(linksToPrepare[i], iconProps.name),
					href,
				},
			];
		}
		// Sort data with icons without label last and those with icon === globe first
		linksData.sort((a, b) => {
			if (a.iconProps?.name === 'globe' && b.iconProps?.name !== 'globe') {
				return -1;
			}
			if (a.iconProps?.name !== 'globe' && b.iconProps?.name === 'globe') {
				return 1;
			}
			if (a.label === '' && b.label !== '') {
				return 1;
			}
			if (a.label !== '' && b.label === '') {
				return -1;
			}
			return 0;
		});
		return linksData;
	}

	$: data = prepareLinks(links);
</script>

{#each data as link}
	<a href={link.href} target="_blank" rel="noreferrer">
		<Icon {...link.iconProps} />
		<span>{link.label}</span>
	</a>
{/each}

<style>
	a {
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		span {
			display: none;
		}
	}
</style>
