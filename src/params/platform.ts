export const match: import('@sveltejs/kit').ParamMatcher = (param) => {
	const platforms = ['daolabs', 'juicebox'];
	return platforms.includes(param);
};
