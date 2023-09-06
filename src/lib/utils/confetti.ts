import confetti from 'canvas-confetti';
import { browser } from '$app/environment';

export function throwConfetti(
	seconds = 15,
	options?: [confetti.Options, confetti.Options],
	editing = false,
) {
	if (!browser) return;
	let stop: Function;
	let stoped = false;

	const promise: Promise<unknown> & { stop?: Function } = new Promise((resolve, reject) => {
		const Date = globalThis.Date;
		const duration = seconds * 1000;
		const end = Date.now() + duration;

		stop = (r: any) => {
			(confetti as { reset: Function })?.reset?.();
			stoped = true;
			return reject(r);
		};
		(function frame() {
			if (stoped) return resolve(true);
			// launch a few confetti from the left edge
			void confetti({
				...(options?.[0]
					? options[0]
					: {
							particleCount: 7,
							angle: 60,
							spread: 55,
							origin: { x: 0 },
					  }),
				...(editing
					? {
							zIndex: 10000,
					  }
					: {}),
			});
			// and launch a few from the right edge
			void confetti({
				...(options?.[1]
					? options[1]
					: {
							particleCount: 7,
							angle: 120,
							spread: 55,
							origin: { x: 1 },
					  }),
				...(editing
					? {
							zIndex: 10000,
					  }
					: {}),
			});

			// keep going until we are out of time
			if (Date.now() < end && !stoped) {
				requestAnimationFrame(frame);
			} else {
				resolve(true);
			}
		})();
	});

	promise.stop = stop;

	return promise;
}

export function getDefaultConfettiOptions() {
	return {
		useDefault: true,
		seconds: 15,
		onPay: [
			{
				particleCount: 7,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
			},
			{
				particleCount: 7,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
			},
		].map<confetti.Options>((opts) => ({
			particleCount: 50,
			angle: 90,
			spread: 45,
			startVelocity: 45,
			decay: 0.9,
			gravity: 1,
			drift: 0,
			ticks: 200,
			...opts,
			origin: { x: 0.5, y: 0.5, ...(opts.origin || {}) },
		})),
	};
}
