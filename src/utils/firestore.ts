import {
	deleteDoc,
	doc,
	onSnapshot,
	setDoc,
	type DocumentReference,
	collection,
	query,
	CollectionReference,
	type WhereFilterOp,
	where,
	updateDoc,
	orderBy,
	QueryConstraint,
	type OrderByDirection,
} from 'firebase/firestore';
import { writable, type Subscriber, type Unsubscriber } from 'svelte/store';
import { firestore } from '$utils/firebase';
import type { PinningState } from '$constants/ipfs';

export type FirestoreNotification = {
	state: PinningState;
	progress: number;
};

export type NotificationStore = {
	subscribe: (
		this: void,
		run: Subscriber<FirestoreNotification>,
		invalidate?: (value?: FirestoreNotification) => void,
	) => Unsubscriber;
	ref: DocumentReference;
	id: string;
};

export function documentStore<T>(ref: string | DocumentReference, document?: T) {
	let unsubscribe: () => void;

	if (!firestore || !globalThis.window) {
		console.warn('Firestore is not initialized or not in browser');
		return {
			subscribe: undefined,
			ref: null,
			id: '',
		};
	}

	const docRef = typeof ref === 'string' ? doc(firestore, ref) : ref;

	const { subscribe } = writable<T | null>(document, (set) => {
		unsubscribe = onSnapshot(docRef, (snapshot) => {
			set((snapshot.data() as T) ?? null);
		});

		return () => unsubscribe();
	});

	return {
		subscribe,
		ref: docRef,
		id: docRef.id,
	};
}

export type CloudMessage = {
	id: string;
	timestamp: number;
	type: string; // TODO: should be a literal type or enum
	readAt: number;
	title: string;
	message: string;
	link?: string;
};

export type CollectionWhereClause<T> = {
	field: keyof T;
	operator: WhereFilterOp;
	value: unknown;
};

export type CollectionOrderByClause<T> = {
	field: keyof T;
	direction: OrderByDirection;
};

export type CloudMessagesStore<T> = {
	subscribe: (this: void, run: Subscriber<T[]>, invalidate?: (value?: T[]) => void) => Unsubscriber;
	ref: CollectionReference;
	id: string;
};

export function collectionStore<T>(
	ref: string | CollectionReference,
	whereClause?: CollectionWhereClause<T>,
	orderByClause?: CollectionOrderByClause<T>,
	documentCollection?: T[],
) {
	let unsubscribe: () => void;

	if (!firestore || !globalThis.window) {
		console.warn('Firestore is not initialized or not in browser');
		return {
			subscribe: undefined,
			ref: null,
			id: '',
		};
	}

	const collectionRef = typeof ref === 'string' ? collection(firestore, ref) : ref;

	const queryConstraints: QueryConstraint[] = [];
	if (whereClause) {
		queryConstraints.push(
			where(String(whereClause.field), whereClause.operator, whereClause.value),
		);
	}
	if (orderByClause) {
		queryConstraints.push(orderBy(String(orderByClause.field), orderByClause.direction));
	}

	const { subscribe } = writable<T[]>(documentCollection, (set) => {
		unsubscribe = onSnapshot(query(collectionRef, ...queryConstraints), (snapshot) => {
			set(
				snapshot.docs.map((collectionDoc) => {
					const docId = collectionDoc.id;
					return { ...collectionDoc.data(), id: docId } as T;
				}),
			);
		});

		return () => unsubscribe();
	});

	return {
		subscribe,
		ref: collectionRef,
		id: collectionRef.id,
	};
}

const buildCollectionNotificationPath = (id: string) => `notifications/${id}`;

export function notificationStore(collectionId: string): NotificationStore {
	return documentStore<FirestoreNotification>(buildCollectionNotificationPath(collectionId));
}

export function updateNotification(collectionId: string, state: PinningState): Promise<void> {
	const docRef = doc(firestore, buildCollectionNotificationPath(collectionId));
	return setDoc(docRef, { state });
}

export function deleteNotification(collectionId: string): Promise<void> {
	const docRef = doc(firestore, buildCollectionNotificationPath(collectionId));
	return deleteDoc(docRef);
}

export async function markMessageAsRead(account: string, messageId: string): Promise<void> {
	const docRef = doc(firestore, `notifications/${account}/messageCenter/${messageId}`);
	await updateDoc(docRef, { readAt: Date.now() });
}

export function userNotificationCenter<T extends CloudMessage>(
	account: string,
	whereClause?: CollectionWhereClause<T>,
	orderByClause?: CollectionOrderByClause<T>,
): CloudMessagesStore<T> {
	return collectionStore<T>(`notifications/${account}/messageCenter`, whereClause, orderByClause);
}
