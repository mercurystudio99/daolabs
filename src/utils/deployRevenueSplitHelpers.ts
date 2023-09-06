import { isRevenueSplit, type RevenueSplit } from '$models/user/revenue-splits';

export type RevenueSplitIssue = (split: RevenueSplit) => boolean;
export type RevenueSplitIssues = keyof typeof issues;
export type RevenueSplitIssuesText = {
	[key in RevenueSplitIssues]: string;
};

const totalPercentageNotMet = (split: RevenueSplit): boolean => {
	if (split.controllingAddress) {
		// Total percentage can be less than 100% because its possible to edit recipients later
		const firstRecipient = split?.recipients?.[0];
		return !firstRecipient;
	} else {
		return 100 !== split.recipients.reduce((acc, recipient) => acc + Number(recipient.percent), 0);
	}
};

const issues: Record<string, RevenueSplitIssue> = {
	splitNameMissing: (split) => !split.name,
	recipientsMissing: (split) => !split.recipients || split.recipients.length === 0,
	totalPercentageNotMet,
};

const issuesText: RevenueSplitIssuesText = {
	splitNameMissing: 'Revenue split name is missing',
	recipientsMissing: "Split's recipients are missing",
	totalPercentageNotMet: 'Total recipients percentage does not equal to 100%',
};

export const hasRevenueSplitIssues = (split: RevenueSplit): boolean => {
	return Object.values(issues).some((issue) => issue(split));
};

export const getRevenueSplitIssues = (split: RevenueSplit): string[] => {
	const splitIssues = Object.keys(issues).filter((issue) => issues[issue](split));
	return splitIssues.map((issue) => issuesText[issue]);
};

export const isRevenueSplitDeployed = (item: any | RevenueSplit) => {
	return isRevenueSplit(item) && !!item.address;
};
