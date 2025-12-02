self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data = { title: "Reminder", body: event.data.text() }; }
  }
  const title = data.title || "Smart Reminder";
  const options = {
    body: data.body || "You have a reminder.",
    data: data,
    vibrate: [100, 50, 100],
    badge: "/favicon.ico"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = "/dashboard";
  event.waitUntil(clients.matchAll({ type: "window" }).then((clientList) => {
    for (const c of clientList) {
      if (c.url.includes("/dashboard") && "focus" in c) return c.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
