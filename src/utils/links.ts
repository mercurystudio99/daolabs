import type { IconName } from '$lib/components/Icon/types';

export type IconProp = {
	name: IconName;
	viewBox?: string;
};

export const getLinkIconProps = (link: string): IconProp => {
	// TODO: link recognition
	if (link.includes('twitter') || link[0] === '@') {
		return { name: 'twitter', viewBox: '64 64 896 896' };
	}
	if (link.includes('discord')) {
		return { name: 'discord', viewBox: '64 64 896 896' };
	}
	if (link.includes('instagram')) {
		return { name: 'altInstagram', viewBox: '0 0 448 512' };
	}
	if (link.includes('medium')) {
		return { name: 'medium', viewBox: '0 0 14 14' };
	}
	if (link.includes('github')) {
		return { name: 'github' };
	}
	return { name: 'globe', viewBox: '0 0 24 24' };
};
