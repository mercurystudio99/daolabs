/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const startIntroTour = (options) => {
	// @ts-ignore
	introJs()
		.setOptions(options)
		.onbeforechange(function () {
			if (this._introItems[this._currentStep].scrollToElement === false) {
				this._options.scrollToElement = false;
			} else {
				this._options.scrollToElement = true;
			}
		})
		.start();
};
export const startHint = (options) => {
	// @ts-ignore
	introJs().setOptions(options).addHints();
};
