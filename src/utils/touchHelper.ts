function touchHelperDirective(node: HTMLElement) {
	const DRAGGABLE_THRESHOLD = 5;
	const DBL_CLICK_DURATION = 500;

	let lastClickTimestamp: number;
	let lastTouchEvent: TouchEvent;
	let lastTarget: Element;
	let dragSource: Element;
	let ptDown: { x: number; y: number };
	let draggableElement: HTMLElement = null;
	let draggableElementOffset: { x: number; y: number };
	let dataTransfer: DataTransfer;

	const shouldHandleTouchEvent = (e: TouchEvent) => {
		return e && !e.defaultPrevented && e.touches && e.touches.length < 2;
	};

	const getPoint = (event: TouchEvent, page: boolean = false) => {
		if (event && event.touches && event.touches.length > 0) {
			const t = event.touches[0];
			return { x: page ? t.pageX : t.clientX, y: page ? t.pageY : t.clientY };
		}

		return { x: 0, y: 0 };
	};

	const getDelta = (event: TouchEvent) => {
		const point = getPoint(event);
		return Math.abs(point.x - ptDown.x) + Math.abs(point.y - ptDown.y);
	};

	const getTarget = (event: TouchEvent) => {
		const pt = getPoint(event);
		let el = document.elementFromPoint(pt.x, pt.y);
		while (el && getComputedStyle(el).pointerEvents == 'none') {
			el = el.parentElement;
		}

		return el;
	};

	const copyStyle = (src: Element, dst: Element) => {
		'id,class,style,draggable'.split(',').forEach((attr) => dst.removeAttribute(attr));

		if (src instanceof HTMLCanvasElement && dst instanceof HTMLCanvasElement) {
			const cSrc = src,
				cDst = dst;
			cDst.width = cSrc.width;
			cDst.height = cSrc.height;
			cDst.getContext('2d').drawImage(cSrc, 0, 0);
		}

		const cs = getComputedStyle(src);
		for (let i = 0; i < cs.length; i++) {
			const key = cs[i];
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			dst.style[key] = cs[key];
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		dst.style.pointerEvents = 'none';
		for (let i = 0; i < src.children.length; i++) {
			copyStyle(src.children[i], dst.children[i]);
		}
	};

	const destroyDraggableElement = () => {
		if (draggableElement && draggableElement.parentElement) {
			draggableElement.parentElement.removeChild(draggableElement);
		}
		draggableElement = null;
	};

	const moveDraggableElement = (event: TouchEvent) => {
		requestAnimationFrame(() => {
			const point = getPoint(event, true);
			const s = draggableElement.style;
			s.position = 'absolute';
			s.pointerEvents = 'none';
			s.zIndex = '999999';
			s.left = `${Math.round(point.x - draggableElementOffset.x)}px`;
			s.top = `${Math.round(point.y - draggableElementOffset.y)}px`;
		});
	};

	const createDraggableElement = (event: TouchEvent) => {
		if (draggableElement) {
			destroyDraggableElement();
		}
		draggableElement = dragSource.cloneNode(true);
		copyStyle(dragSource, draggableElement);
		draggableElement.style.top = draggableElement.style.left = '-9999px';

		const rect = dragSource.getBoundingClientRect(),
			pt = getPoint(event);
		draggableElementOffset = { x: pt.x - rect.left, y: pt.y - rect.top };
		draggableElement.style.opacity = '0.5';

		moveDraggableElement(event);
		document.body.appendChild(draggableElement);
	};

	const closestDraggable = (e: Element): Element => {
		for (; e; e = e.parentElement) {
			if (e.hasAttribute('draggable')) {
				return e;
			}
		}

		return null;
	};

	const reset = () => {
		destroyDraggableElement();
		dragSource = null;
		lastTouchEvent = null;
		lastTarget = null;
		ptDown = null;
		dataTransfer = new DataTransfer();
	};

	const buildEventOptions = (event: TouchEvent): MouseEventInit => {
		return {
			bubbles: true,
			cancelable: true,
			button: 0,
			buttons: 1,
			altKey: event.altKey,
			ctrlKey: event.ctrlKey,
			metaKey: event.metaKey,
			shiftKey: event.shiftKey,
			clientX: event.touches[0]?.clientX,
			clientY: event.touches[0]?.clientY,
			screenX: event.touches[0]?.screenX,
			screenY: event.touches[0]?.screenY,
		};
	};

	const dispatchEvent = (event: TouchEvent, type: string, target: EventTarget): boolean => {
		if (!(event && target)) return false;

		const eventOptions = buildEventOptions(event);
		const emittedEvent =
			type === 'drop' || type.indexOf('drag') === 0
				? new DragEvent(type, { ...eventOptions, dataTransfer })
				: new MouseEvent(type, eventOptions);

		target.dispatchEvent(emittedEvent);
		return emittedEvent.defaultPrevented;
	};

	const touchStartHandler = (event: TouchEvent) => {
		if (!shouldHandleTouchEvent(event)) return;

		// Raise dblclick and prevent zooming
		if (Date.now() - lastClickTimestamp < DBL_CLICK_DURATION) {
			if (dispatchEvent(event, 'dblclick', event.target)) {
				event.preventDefault();
				reset();
				return;
			}
		}
		reset();

		const src = closestDraggable(event.target);
		if (src) {
			if (
				!dispatchEvent(event, 'mousemove', event.target) &&
				!dispatchEvent(event, 'mousedown', event.target)
			) {
				dragSource = src;
				ptDown = getPoint(event);
				lastTouchEvent = event;
				event.preventDefault();

				setTimeout(() => {
					if (dragSource === src && !draggableElement) {
						if (dispatchEvent(event, 'contextmenu', src)) {
							reset();
						}
					}
				}, 900);
			}
		}
	};

	const touchMoveHandler = (event: TouchEvent) => {
		if (!shouldHandleTouchEvent(event)) return;

		const target = getTarget(event);
		if (dispatchEvent(event, 'mousemove', target)) {
			lastTouchEvent = event;
			event.preventDefault();
			return;
		}

		if (dragSource && !draggableElement) {
			const delta = getDelta(event);
			if (delta > DRAGGABLE_THRESHOLD) {
				dispatchEvent(event, 'dragstart', dragSource);
				createDraggableElement(event);
				dispatchEvent(event, 'dragenter', target);
			}
		}

		if (draggableElement) {
			lastTouchEvent = event;
			event.preventDefault();
			if (target != lastTarget) {
				dispatchEvent(lastTouchEvent, 'dragleave', lastTarget);
				dispatchEvent(event, 'dragenter', target);
				lastTarget = target;
			}
			moveDraggableElement(event);
			dispatchEvent(event, 'dragover', target);
		}
	};

	const touchEndHandler = (event: TouchEvent) => {
		if (!shouldHandleTouchEvent(event)) return;

		if (dispatchEvent(lastTouchEvent, 'mouseup', event.target)) {
			event.preventDefault();
			return;
		}

		// Simulate click because user didn't drag element
		if (!draggableElement) {
			dragSource = null;
			dispatchEvent(lastTouchEvent, 'click', event.target);
			lastClickTimestamp = Date.now();
		}
		// finish dragging
		destroyDraggableElement();
		if (dragSource) {
			if (event.type.indexOf('cancel') < 0) {
				dispatchEvent(lastTouchEvent, 'drop', lastTarget);
			}
			dispatchEvent(lastTouchEvent, 'dragend', dragSource);
			reset();
		}
	};

	node.addEventListener('touchstart', touchStartHandler);
	node.addEventListener('touchmove', touchMoveHandler);
	node.addEventListener('touchend', touchEndHandler);
	node.addEventListener('touchcancel', touchEndHandler);

	return {
		destroy() {
			node.removeEventListener('touchstart', touchStartHandler);
			node.removeEventListener('touchmove', touchMoveHandler);
			node.removeEventListener('touchend', touchEndHandler);
			node.removeEventListener('touchcancel', touchEndHandler);
		},
	};
}

export default touchHelperDirective;
