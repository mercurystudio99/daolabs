import type { iconOptions } from '$lib/components/Icon';

type TimelinePosition = 'right' | 'left' | 'alternate';

type ParentPosition = 'right' | 'left';

type TimelineConfig = {
	rootPosition: TimelinePosition;
};

type Step = {
	label: string;
	description?: string;
	descriptionIcon?: typeof iconOptions[number];
	time?: string;
};

export { TimelinePosition, ParentPosition, TimelineConfig, Step };
