import { test, expect } from '@playwright/test';
import { fakeJwtToken } from './Test-helper';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.addInitScript((token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('language', 'pl');
    }, fakeJwtToken);
});

test('Pomyślne pobranie powiadomień i odznaczenie ich jako odczytane', async ({ page }) => {
    await page.goto('/');

    await page.route('**/api/notifications/*/pl', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, title: 'Nowe powiadomienie', description: 'Opis 1', timeStamp: new Date().toISOString(), isRead: false },
                { id: 2, title: 'Drugie powiadomienie', description: 'Opis 2', timeStamp: new Date().toISOString(), isRead: false }
            ])
        });
    });

    await page.route('**/api/notifications/*/markAllRead', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.click('#notification-bell');

    const notificationsList = page.locator('.notifications-list li');
    await expect(notificationsList).toHaveCount(2);
    await expect(notificationsList.first()).toContainText('Drugie powiadomienie');

    await page.mouse.click(0, 0);
    await expect(page.locator('#notifications-bubble')).toHaveCount(0);
});