import {
	child,
	DataSnapshot,
	get,
	push,
	ref,
	query,
	orderByChild,
	equalTo,
	remove,
	set,
	update,
	type DatabaseReference,
} from 'firebase/database';
import { database } from '$utils/firebase';
import { generateId } from '$lib/utils/generateId';
import { convertFirebaseModel } from '$utils/firebaseUtils';
import { connectedAccount, readNetwork } from '$stores/web3';
import {
	isRevenueSplit,
	type RevenueSplit,
	type RevenueSplitCreator,
} from '$models/user/revenue-splits';
import type Store from '$utils/Store';
import type { User } from '$utils/users/user';

function getRevenueSplitsByAccount(account: string, userStore: Store<User>) {
	const currentNetworkSplits = get(
		query(
			ref(database, `revenue-splits`),
			orderByChild('network'),
			equalTo(`${readNetwork.get().alias}`),
		),
	);
	const noNetworkSplits = get(
		query(ref(database, `revenue-splits`), orderByChild('network'), equalTo(``)),
	);

	Promise.allSettled([noNetworkSplits, currentNetworkSplits])
		.then((results) => {
			const splits: RevenueSplit[] = [];
			const rejected: string[] = [];

			for (let i = 0; i < results.length; i++) {
				const result: PromiseSettledResult<DataSnapshot> = results[i];
				if (result.status == 'fulfilled') {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const revenueObj = result.value.val();
					for (const key in revenueObj) {
						if (Object.prototype.hasOwnProperty.call(revenueObj, key)) {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							const split = revenueObj[key] as RevenueSplit;
							if (split.creator.toLowerCase() === account.toLowerCase()) {
								splits.push({ ...split, firebaseId: key });
							}
						}
					}
				} else {
					if (i == 0) rejected.push('no network');
					else if (i == 1) rejected.push(`${readNetwork.get().alias}`);
				}
			}
			userStore.update((userState) => {
				return {
					...userState,
					revenueSplits: splits,
					revenueFailed: rejected.join(', '),
				};
			});
		})
		.catch((e) => {
			console.error(e);
		});
}

async function getRevenueSplits() {
	const snapshot = await get(child(ref(database), 'revenue-splits'));
	if (!snapshot.exists()) return [];

	const split = snapshot.toJSON() as Record<string, RevenueSplit>;
	const splits: RevenueSplit[] = [];
	for (const id in split) {
		if (Object.prototype.hasOwnProperty.call(split, id)) {
			splits.push({ ...split[id], firebaseId: id });
		}
	}

	return splits;
}

async function getRevenueSplitById(splitId: string) {
	const splits = await getRevenueSplits();
	const split = splits.find((r) => r.id === splitId);

	return split ? convertFirebaseModel(split) : split;
}

async function deleteRevenueSplitById(firebaseId: string) {
	const revenueSplitRef = ref(database, `revenue-splits/${firebaseId}`);
	await remove(revenueSplitRef);
}

async function saveRevenueSplit(split: RevenueSplit): Promise<boolean> {
	try {
		const splitRef = ref(database, 'revenue-splits');
		const newSplit = push(splitRef);
		await set(newSplit, { ...split, createdAt: Date.now() });
		return true;
	} catch (error) {
		console.error('[Save Revenue split] :', error);
		throw error;
	}
}

async function updateRevenueSplit(split: RevenueSplit): Promise<boolean> {
	try {
		const splitRef = ref(database, `revenue-splits/${split.firebaseId}`);
		await update(splitRef, split);
		return true;
	} catch (error) {
		console.error('[Update revenue split] :', error);
		throw error;
	}
}

async function tryMigrateRevenueSplits(
	dbRef: DatabaseReference,
	splits: RevenueSplit[],
	account: string,
) {
	if (splits.length === 0) return [];

	for (let i = 0; i < splits.length; i++) {
		if (!Object.prototype.hasOwnProperty.call(splits[i], 'creator')) {
			const split = { ...splits[i], creator: account, id: generateId() };
			if (await saveRevenueSplit(split)) {
				splits[i] = { ...split };
			}
		}
	}

	const notMigrated = splits.filter((r) => !Object.prototype.hasOwnProperty.call(r, 'creator'));
	await update(dbRef, {
		revenueSplits: notMigrated,
	});

	return notMigrated;
}

const buildSplitName = (
	collectionName: string,
	createdBy: RevenueSplitCreator,
): Partial<Pick<RevenueSplit, 'name' | 'createdBy'>> => {
	if (createdBy === 'user') {
		return { createdBy };
	} else {
		return {
			createdBy,
			name:
				createdBy === 'collectionPricing'
					? `${collectionName} split`
					: `${collectionName} royalty split`,
		};
	}
};

const handleRevenueSplitChange = async <T>(
	current: T | RevenueSplit,
	updated: T | RevenueSplit,
	collectionName: string,
	createdBy: RevenueSplitCreator,
) => {
	if (!isRevenueSplit(updated) && isRevenueSplit(current)) {
		await deleteRevenueSplitById(current.firebaseId);
	} else if (isRevenueSplit(updated)) {
		if (!current || !isRevenueSplit(current)) {
			const split = {
				...updated,
				...buildSplitName(collectionName, createdBy),
				id: generateId(),
				creator: connectedAccount.get(),
			} as RevenueSplit;
			await saveRevenueSplit(split);
			return getRevenueSplitById(split.id);
		} else {
			await updateRevenueSplit(updated);
		}
	}

	return Promise.resolve();
};

async function tryGetLatestRevenueSplit<T>(
	split: T | RevenueSplit,
	createdBy: RevenueSplitCreator,
): Promise<T | RevenueSplit> {
	if (isRevenueSplit(split) && 'firebaseId' in split && 'id' in split) {
		const latestSplit = await getRevenueSplitById(split.id);
		if (latestSplit && JSON.stringify(split) !== JSON.stringify(latestSplit)) {
			return { ...latestSplit, createdBy };
		}
	}

	return split;
}

export {
	getRevenueSplitsByAccount,
	getRevenueSplits,
	getRevenueSplitById,
	saveRevenueSplit,
	updateRevenueSplit,
	deleteRevenueSplitById,
	tryMigrateRevenueSplits,
	tryGetLatestRevenueSplit,
	handleRevenueSplitChange,
};
