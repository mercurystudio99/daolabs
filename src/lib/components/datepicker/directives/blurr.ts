export default (node: HTMLElement) => {
	const click = (evt: Event) => {
		if (!node || node.contains(evt.target as Node) || evt.defaultPrevented) return;
		node.dispatchEvent(new CustomEvent('blurr', node as CustomEventInit<unknown>));
	};

	document.addEventListener('click', click, true);

	return {
		destroy() {
			document.removeEventListener('click', click, true);
		},
	};
};
