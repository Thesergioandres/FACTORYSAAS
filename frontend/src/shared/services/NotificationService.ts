type NotificationPermissionState = 'default' | 'denied' | 'granted';

type NotificationPayload = {
  title: string;
  body: string;
};

const isSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isSupported()) {
    return 'denied';
  }

  const current = Notification.permission;
  if (current !== 'default') {
    return current;
  }

  return Notification.requestPermission();
}

export async function sendLocalNotification(title: string, body: string) {
  if (!isSupported()) {
    return;
  }

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (granted !== 'granted') {
      return;
    }
  }

  const payload: NotificationPayload = { title, body };

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && 'showNotification' in registration) {
      await registration.showNotification(payload.title, { body: payload.body });
      return;
    }
  }

  new Notification(payload.title, { body: payload.body });
}
