import { test, expect } from '@playwright/test';
import { fakeJwtToken, fakeAdminJwtToken } from './Test-helper';
import { formatToDatetimeLocal } from '../src/Reservations/DateHelper';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.addInitScript((token) => {
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

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/reservationsManagement');

    const start = formatToDatetimeLocal('2025-08-12T12:00:00Z');
    const end = formatToDatetimeLocal('2025-08-12T15:00:00Z');
    await expect(page.locator('em', { hasText: 'Tor Kartingowy Szybka Strefa' })).toBeVisible();
    await expect(page.locator(`li.list-group-item >> text=Rezerwacja ${formatToDatetimeLocal(start)} - ${formatToDatetimeLocal(end)}`)).toBeVisible();
    // Godzny się różną, gdyż w formatowaniu jest brana pod uwagę strefa czasowa
})

test.skip('Pomyślne pobranie listy wszystkich rezerwacji danego użytkownika', async ({ page }) => {
    await page.route('**/api/tracks*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Tor Kartingowy Szybka Strefa' }
            ])
        });
    });

    let userId = 0;
    await page.route('**/api/reservations/user**', route => {
        const url = new URL(route.request().url());
        userId = Number(url.searchParams.get('userId'));

        const reservations = [
            {
                id: 22,
                start: '2025-08-12T12:00:00Z',
                end: '2025-08-12T15:00:00Z',
                cost: 600,
                userId: userId,
                trackId: 1,
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
                userId: userId,
                trackId: 1,
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

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: userId, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/myReservations');

    const start = formatToDatetimeLocal('2025-08-12T12:00:00Z');
    const end = formatToDatetimeLocal('2025-08-12T15:00:00Z');
    await page.screenshot({ path: "res.png" });
    await expect(page.locator('em', { hasText: 'Tor Kartingowy Szybka Strefa' })).toBeVisible();
    await expect(page.locator(`li.list-group-item >> text=Rezerwacja ${formatToDatetimeLocal(start)} - ${formatToDatetimeLocal(end)}`)).toBeVisible();
    // Godzny się różną, gdyż w formatowaniu jest brana pod uwagę strefa czasowa
})


test.skip('Pomyślne utworzenie rezerwacji', async ({ page }) => {
    await page.route('**/api/tracks*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Tor', typeOfSurface: 'Twarda', length: 1000, openingHour: "08:00", closingHour: "20:00", availableDays: ['Wtorek', 'Środa', 'Piątek'], facilityId: 1 },
                { id: 2, name: 'Inny', typeOfSurface: 'Miękka', length: 2000, openingHour: "10:00", closingHour: "20:00", availableDays: ['Wtorek', 'Środa'], facilityId: 2 }
            ]),
        });
    });

    await page.route('**/api/equipments/inFacility?facilityId=1', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Rower', type: 'Górski', cost: 250, facilityId: 1 }]),
            });
        } else {
            route.continue();
        }
    });

    await page.goto('http://localhost:5173/makeReservation');
    await page.selectOption('#trackSelect', '1');
    await page.screenshot({ path: "add1.png" });

});

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

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/reservationsManagement');

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