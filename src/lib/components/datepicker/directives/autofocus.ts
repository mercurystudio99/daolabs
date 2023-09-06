export default (node: HTMLElement, { delay = 0 }) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	setTimeout(node.focus.bind(node), delay);
};
