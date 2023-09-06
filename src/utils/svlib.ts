/* eslint-disable @typescript-eslint/no-unsafe-call */
// @ts-nocheck
import { svlibLoaded } from '$stores';

export const loadSunvoxLibrary = () => {
	if (!svlibLoaded.get()) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		svlib.then((Module) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			svlib = Module;
			sv_init(0, 44100, 2, 0);
			sv_open_slot(0);
			svlibLoaded.set(true);
		});
	}
};
