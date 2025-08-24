import { test, expect } from '@playwright/test';
import { fakeJwtToken, fakeAdminJwtToken } from './Test-helper';
import { formatToDatetimeLocal } from '../src/Reservations/DateHelper';
import type { Reservation, Track } from '../src/Types/Types';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);
});

test('Pomyślne pobranie listy wszystkich rezerwacji w danym torze', async ({ page }) => {
    await page.route('**/api/tracks*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Tor Kartingowy Szybka Strefa' }
            ])
        });
    });

    await page.route('**/api/reservations/inTrack**', route => {
        const url = new URL(route.request().url());
        const trackId = Number(url.searchParams.get('trackId'));

        const reservations = [
            {
                id: 22,
                start: '2025-08-12T12:00:00Z',
                end: '2025-08-12T15:00:00Z',
                cost: 600,
                userId: 12,
                trackId: trackId,
                statusId: 1,
                user: null,
                track: null,
                status: null,
                equipmentReservations: []
            },
            {
                id: 22,
                start: '2025-08-12T16:00:00Z',
                end: '2025-08-12T17:00:00Z',
                cost: 600,
                userId: 12,
                trackId: trackId,
                statusId: 1,
                user: null,
                track: null,
                status: null,
                equipmentReservations: []
            }
        ];

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(reservations)
        });
    });

    await page.goto('/adminPanel/reservationsManagement');

    const start = formatToDatetimeLocal('2025-08-12T12:00:00Z');
    const end = formatToDatetimeLocal('2025-08-12T15:00:00Z');

    await expect(page.locator('em', { hasText: 'Tor Kartingowy Szybka Strefa' })).toBeVisible();
    await expect(page.locator(`li.list-group-item >> text=Rezerwacja ${formatToDatetimeLocal(start)} - ${formatToDatetimeLocal(end)}`)).toBeVisible();
    // Godzny się różną, gdyż w formatowaniu jest brana pod uwagę strefa czasowa
})

test('Pomyślne usunięcie rezerwacji', async ({ page }) => {
    await page.route('**/api/tracks*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Tor Kartingowy Szybka Strefa' }
            ])
        });
    });

    let reservations = [
        {
            id: 1235,
            start: '2025-08-12T12:00:00Z',
            end: '2025-08-12T15:00:00Z',
            cost: 600,
            userId: 12,
            trackId: 1,
            statusId: 1,
            user: null,
            track: null,
            status: null,
            equipmentReservations: []
        }
    ]

    await page.route('**/api/reservations/inTrack**', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(reservations)
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/reservations/1235', route => {
        if (route.request().method() === 'DELETE') {
            reservations = [];
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Usunięto rezerwację' }),
            });
        } else {
            route.fallback();
        }
    });

    await page.goto('/adminPanel/reservationsManagement');

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć tę rezerwację?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');

    const start = formatToDatetimeLocal('2025-08-12T12:00:00Z');
    const end = formatToDatetimeLocal('2025-08-12T15:00:00Z');
    await expect(page.locator(`text=Rezerwacja: ${formatToDatetimeLocal(start)} - ${formatToDatetimeLocal(end)}`)).toHaveCount(0);
});

// TODO (Jeżeli wystarczy czasu): Dodać test sprawdzający dodawanie i edycję rezerwacji.