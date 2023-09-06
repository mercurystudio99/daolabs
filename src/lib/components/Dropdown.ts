import type { IconName } from './Icon';

export type DropdownOption = {
	label: string | number;
	value: string | number | boolean | object;
	icon?: IconName;
	// eslint-disable-next-line
		iconProps?: Record<string, unknown>;
};
