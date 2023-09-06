interface Option {
	title: string;
	intro: string;
	element?: string;
	position?: string;
	preChange?: () => void;
}

export interface IntroJsOptionType {
	steps: Array<Option>;
	dontShowAgain?: boolean;
}
