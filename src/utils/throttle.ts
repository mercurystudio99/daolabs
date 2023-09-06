export function throttle(fn, interval: number, options) {
	let timeoutId: ReturnType<typeof setTimeout> = null;
	let throttledFn: () => {} = null;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	let leading: boolean = (options && options.leading) as boolean;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	let trailing: boolean = (options && options.trailing) as boolean;

	if (leading == null) {
		leading = true; // default
	}

	if (trailing == null) {
		trailing = !leading; // default
	}

	if (leading == true) {
		trailing = false; // forced because there should be invocation per call
	}

	const cancel = function () {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	const flush = function () {
		const call = throttledFn;
		cancel();

		if (call) {
			call();
		}
	};

	const throttleWrapper = function () {
		let callNow = leading && !timeoutId;
		const context: unknown = this;
		// eslint-disable-next-line prefer-rest-params
		const args = arguments;

		throttledFn = function () {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
			return fn.apply(context, args);
		};

		if (!timeoutId) {
			timeoutId = setTimeout(() => {
				timeoutId = null;

				if (trailing) {
					return throttledFn();
				}
			}, interval);
		}

		if (callNow) {
			callNow = false;
			return throttledFn();
		}
	};

	throttleWrapper.cancel = cancel;
	throttleWrapper.flush = flush;

	return throttleWrapper;
}
