export const match: import('@sveltejs/kit').ParamMatcher = (param) => {
	const userTabs = ['assets', 'nfts', 'collections', 'projects', 'revenue', 'notifications'];
	return userTabs.indexOf(param) > -1;
};
