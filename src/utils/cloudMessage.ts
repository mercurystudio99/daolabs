import { deleteToken, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { firestore, getCloudMessaging } from '$utils/firebase';
import { createCustomNotification, errorHandle } from '$utils/notification';

async function createMessaging(userId: string) {
	try {
		const messaging = getCloudMessaging();
		if (!messaging) {
			return;
		}

		const permissions = Notification.permission;

		if (permissions !== 'granted') {
			await Notification.requestPermission();
		}

		if ('serviceWorker' in navigator) {
			const serviceWorkerRegistration = await navigator.serviceWorker.register(
				'/firebase-messaging-sw.js',
			);
			if (!import.meta.env.VITE_VAPID_KEY) {
				throw Error('Must set VITE_VAPID_KEY environment variable');
			}
			const token = await getToken(messaging, {
				vapidKey: import.meta.env.VITE_VAPID_KEY as string,
				serviceWorkerRegistration,
			});

			if (token) {
				const notificationRef = doc(firestore, 'notifications', userId);
				await setDoc(notificationRef, { token });
			}

			onMessage(messaging, (payload) => {
				const title = payload?.data?.title ?? payload?.notification?.title ?? 'Juicebox';
				const body = payload?.data?.body ?? payload?.notification?.body ?? '';

				createCustomNotification({
					type: 'hint',
					message: `${title} ${body}`,
					autoDismiss: 3000,
				});
			});
		}

		return () => {
			return deleteToken(messaging);
		};
	} catch (error) {
		if (error instanceof Error) {
			errorHandle(error.message);
		} else {
			console.error('Error while creating cloud messaging', error);
		}
	}
}

let unsubscribe: () => Promise<boolean>;

export const handleCloudMessage = (userId: string) => {
	if (userId) {
		createMessaging(userId)
			.then((fn) => (unsubscribe = fn))
			.catch((err) => console.log(err));
	} else if (unsubscribe) {
		unsubscribe().catch((err) => console.log(err));
	}
};
