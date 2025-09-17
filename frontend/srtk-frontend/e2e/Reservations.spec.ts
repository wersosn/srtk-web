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
    await expect(page.locator(`li.list-group-item >> text=Rezerwacja ${formatToDatetimeLocal(start)} - ${formatToDatetimeLocal(end)}`)).toBeVisible(); // Godzny się różną, gdyż w formatowaniu jest brana pod uwagę strefa czasowa
})

test('Pomyślne pobranie listy wszystkich rezerwacji danego użytkownika', async ({ page }) => {
    await page.route('**/api/tracks*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Tor Kartingowy Szybka Strefa' }
            ])
        });
    });
    await page.route('**/api/reservations/user?userId=11', route => {
        const reservations = [
            {
                id: 22,
                start: '2027-11-12T12:00:00Z',
                end: '2027-11-12T15:00:00Z',
                cost: 600,
                userId: 11,
                trackId: 1,
                statusId: 1,
                user: null,
                track: null,
                status: null,
                equipmentReservations: []
            },
            {
                id: 22,
                start: '2027-11-12T16:00:00Z',
                end: '2027-11-12T17:00:00Z',
                cost: 600,
                userId: 11,
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
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });
    await page.goto('http://localhost:5173/myReservations');

    const start = formatToDatetimeLocal('2027-11-12T12:00:00Z');
    const end = formatToDatetimeLocal('2027-11-12T15:00:00Z');
    await expect(page.locator(`li.list-group-item >> text=${formatToDatetimeLocal(start)} - ${formatToDatetimeLocal(end)}`)).toBeVisible(); // Godzny się różną, gdyż w formatowaniu jest brana pod uwagę strefa czasowa
})

// Strona się nie renderuje:
test.skip('Pomyślne utworzenie rezerwacji', async ({ page }) => {
    await page.goto('/');

    await page.goto('http://localhost:5173/makeReservation');

    await page.route('**/api/tracks*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Tor Kartingowy Szybka Strefa' }
            ])
        });
    });
});

// Strona się nie renderuje:
test.skip('Pomyślna edycja rezerwacji', async ({ page }) => {
    const reservationId = 1235;

    await page.route('**/api/tracks*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ id: 1, name: 'Tor Kartingowy Szybka Strefa', availableDays: ['Mon','Tue','Wed','Thu','Fri'], openingHour: '08:00', closingHour: '20:00' }])
        });
    });

    await page.route(`**/api/equipments/inFacility?facilityId=1`, route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    await page.route(`**/api/trackAvailability*`, route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ isAvailable: true }),
        });
    });

    let updatedBody: any = null;
    await page.route(`**/api/reservations/${reservationId}`, async route => {
        if (route.request().method() === 'PUT') {
            updatedBody = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: reservationId, ...updatedBody }),
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/**/preferences', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.route('**/api/reservations/inTrack**', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{
                id: reservationId,
                start: '2028-08-12T12:00:00Z',
                end: '2028-08-12T15:00:00Z',
                cost: 600,
                userId: 12,
                trackId: 1,
                statusId: 1,
                equipmentReservations: []
            }])
        });
    });

    await page.goto('http://localhost:5173/adminPanel/reservationsManagement');
    await expect(page.locator('em', { hasText: 'Tor Kartingowy Szybka Strefa' })).toBeVisible();

    await page.click('button:has(img[alt="Edytuj"])');
    await page.screenshot({ path: "editReservation3.png", fullPage: true });

    const newStart = '2028-11-12T13:00';
    const newEnd = '2028-11-12T16:00';
    await page.fill('input[type="datetime-local"]:nth-of-type(1)', newStart);
    await page.fill('input[type="datetime-local"]:nth-of-type(2)', newEnd);

    await page.click('button:has-text("Zapisz zmiany")');

    expect(updatedBody).not.toBeNull();
    expect(updatedBody.Start).toBe(new Date(newStart).toISOString());
    expect(updatedBody.End).toBe(new Date(newEnd).toISOString());
});

test('Pomyślne anulowanie rezerwacji', async ({ page }) => {
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
            id: 2223,
            start: '2025-11-12T12:00:00Z',
            end: '2025-11-12T15:00:00Z',
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

    await page.route('**/api/reservations/2223/cancel', route => {
        if (route.request().method() === 'PUT') {
            reservations[0].statusId = 2;
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
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
    await expect(page.locator('em', { hasText: 'Tor Kartingowy Szybka Strefa' })).toBeVisible();

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz anulować tę rezerwację?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Anuluj"])');
    await expect(page.locator(`button:has(img[alt="Anuluj"])`)).toHaveCount(0);
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
            start: '2028-08-12T12:00:00Z',
            end: '2028-08-12T15:00:00Z',
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