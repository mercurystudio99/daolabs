export type CommitData = { hash: string; timestamp: string };

export const getCommitHash = () => {
	try {
		const commit = import.meta.env.VITE_LAST_COMMIT_DATA as string;
		const [CommitHash, Date, Time]: string[] = commit.split(' ');

		return {
			hash: CommitHash,
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			timestamp: `${Date.split('-').join('')}-${Time.split(':').join('')}`,
		};
	} catch {
		return null;
	}
};
