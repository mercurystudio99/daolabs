export const match: import('@sveltejs/kit').ParamMatcher = (param) => {
	return /^[1-9]\d*$/.test(param);
};
