import { scrollStep } from '../config/scroll';

export function convertTouchEventToArray(event: TouchEvent) {
	return Array.from(event.touches);
}

export default (
	node: HTMLElement,
	opts: {
		y: number;
		step: number;
		maxSteps?: number;
	},
) => {
	let { y: yi = 0 } = opts;
	const { step = scrollStep } = opts;
	let lastTouch = 0;
	let y = yi;

	const updateY = (value: number) => {
		const { maxSteps = Infinity } = opts;
		y = Math.max(0, Math.min(maxSteps * step, value));
	};

	const emitY = () => {
		if (Math.round(y / step) === Math.round(yi / step)) return;
		yi = y;
		node.dispatchEvent(
			new CustomEvent('y', {
				detail: {
					y,
					step: Math.round(y / step),
				},
			}),
		);
	};

	const wheelListener = ({ deltaY }: WheelEvent) => {
		updateY(y + deltaY);
		emitY();
	};
	const touchstartListener = (event: TouchEvent) => {
		lastTouch = convertTouchEventToArray(event)[0].pageY;
		emitY();
	};
	const touchmoveListener = (event: TouchEvent) => {
		const pageY = convertTouchEventToArray(event)[0].pageY;
		updateY(y - (pageY - lastTouch));
		lastTouch = pageY;
		emitY();
	};

	node.addEventListener('wheel', wheelListener);
	node.addEventListener('touchstart', touchstartListener);
	node.addEventListener('touchmove', touchmoveListener);
	node.style.touchAction = 'none';

	return {
		destroy() {
			node.removeEventListener('wheel', wheelListener);
			node.removeEventListener('touchstart', touchstartListener);
			node.removeEventListener('touchmove', touchmoveListener);
		},
	};
};
