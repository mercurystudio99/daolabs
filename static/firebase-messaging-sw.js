importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC2J_mE0ZOOd-KT_O6HvAv-YKOr3cdKyiA',
  projectId: 'juicebox-svelte',
  appId: '1:1073324340593:web:a631a80d409179f5be32d0',
  messagingSenderId: '1073324340593',
  authDomain: 'juicebox-svelte.firebaseapp.com',
  measurementId: 'G-XCC2XFY8R4'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) {
    return;
  }

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/images/juice_logo-ol.png'
  };
  
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions);
});
