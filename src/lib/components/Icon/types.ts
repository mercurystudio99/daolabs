import svgs from './svgByName';

export const iconOptions = [
	...Object.keys(svgs),
	'metamask',
	'sushiswap',
	'instagramColor',
	'jsonFile',
];
export const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

type ExtendedIcon = {
	svg?: svelte.JSX.SVGProps<SVGElement>;
	paths?: string[];
	markup?: string;
	sensible?: boolean;
};

export type IconType = string[] | ExtendedIcon;

export type IconName = typeof iconOptions[number];
