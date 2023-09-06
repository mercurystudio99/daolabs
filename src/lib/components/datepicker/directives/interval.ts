export default (node, { fn, duration }) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const interval = setInterval(fn, duration);
	return () => {
		clearInterval(interval);
	};
};
