// Ilość widocznych powiadomień:
let currentPage = 1;
const notificationsPerPage = 5;

// Funkcja do przełączania widoczności chmurki:
function toggleNotifications() {
    const bubble = document.getElementById('notifications-bubble');
    if (bubble.style.display !== 'block') {
        loadNotifications();
        bubble.style.display = 'block';
        updateNotificationBadge(0);
    } else {
        bubble.style.display = 'none';
    }
}

// Zamknięcie chmurki po kliknięciu poza nią:
document.addEventListener('click', function (event) {
    const bell = document.getElementById('notification-bell');
    const bubble = document.getElementById('notifications-bubble');

    if (bell && bubble && !bell.contains(event.target) && !bubble.contains(event.target)) {
        bubble.style.display = 'none';
    }
});

// Załadowanie powiadomień użytkownika:
function loadNotifications() {
    fetch('/api/notifications/${userId}/all')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('notifications-list');
            list.innerHTML = '';

            if (data.length > 0) {
                data.forEach(notification => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<strong>${notification.Message}</strong>`;
                    list.appendChild(listItem);
                });
            } else {
                list.innerHTML = '<li>Brak nowych powiadomień</li>';
            }
            const bubble = document.getElementById('notifications-bubble');
            bubble.scrollTop = bubble.scrollHeight;
            //fetch('/Notifications/MarkAllAsRead', { method: 'POST' });
        })
        .catch(error => console.error('Błąd ładowania powiadomień:', error));
}

// Funkcja do oświeżenia ilości nieodczytanych powiadomień i wyświetlania liczby:
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Funkcja pobierająca ilość nieodczytanych powiadomień:
function fetchNotificationCount() {
    fetch('/api/notifications/${userId}/all')
        .then(response => response.json())
        .then(data => {
            console.log("Ilość nieodczytanych powiadomień:", data);
            updateNotificationBadge(data.count);
        })
        .catch(error => console.error('Błąd pobierania liczby powiadomień:', error));
}

// Odświeżanie licznika co 30 sekund
function unreadNotifications() {
    fetchNotificationCount();
    setInterval(fetchNotificationCount, 30000);
}