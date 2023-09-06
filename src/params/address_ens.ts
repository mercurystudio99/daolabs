export const match: import('@sveltejs/kit').ParamMatcher = (param) => {
	return /^0x[0-9a-fA-F]{40,40}$/.test(param) || param.endsWith('.eth');
};
