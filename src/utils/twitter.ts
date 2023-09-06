interface ProfileDataResponse {
	data: {
		id: number;
		name: string;
		username: string;
		profile_image_url: string;
	};
}

const PROFILE_DATA_PROMISES: { [key: string]: Promise<ProfileDataResponse | null> } = {};

export const getProfile = async (handle: string): Promise<ProfileDataResponse | null> => {
	const key = `${handle}`;
	const firebaseUrl: string = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string;
	const url = `${firebaseUrl}/twitterUser?handle=${handle}`;
	try {
		if (await PROFILE_DATA_PROMISES[key]) {
			return await PROFILE_DATA_PROMISES[key];
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		PROFILE_DATA_PROMISES[key] = fetch(url)
			.then(async (res) => {
				if (res.status === 200) {
					return res.json();
				}
				await Promise.reject('No handle found');
				return null;
			})
			.catch(async () => {
				await Promise.reject();
				return null;
			});
		return await PROFILE_DATA_PROMISES[key];
	} catch {
		return Promise.reject('Error: fetching profile data');
	}
};

export const getLastTweet = async (handle: string) => {
	const firebaseUrl: string = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string;
	const url = `${firebaseUrl}/twitterLatestTweet?handle=${handle}`;
	try {
		const response = await fetch(url);
		const json: unknown = await response.json();
		return json;
	} catch (err) {
		return Promise.reject('Error: fetching last tweet');
	}
};
