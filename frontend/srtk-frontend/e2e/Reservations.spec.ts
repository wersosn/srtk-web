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

test('Pomyślne utworzenie rezerwacji', async ({ page }) => {
    await page.route('**/api/tracks', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 1, name: 'Tor', typeOfSurface: 'Twarda', length: 1000, openingHour: "08:00", closingHour: "20:00", availableDays: 'Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota,Niedziela', facilityId: 1 },
                    { id: 2, name: 'Inny', typeOfSurface: 'Miękka', length: 2000, openingHour: "10:00", closingHour: "20:00", availableDays: 'Wtorek,Środa,Czwartek,Piątek,Sobota', facilityId: 2 }
                ]),
            });
        } else {
            route.continue();
        }
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

    await page.route('**/api/reservations/isAvailable?*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ available: true }),
        });
    });

    const reservation =
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
    };

    await page.route('**/api/reservations', async route => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(reservation),
            });
        } else {
            await route.abort();
        }
    });

    await page.goto('http://localhost:5173/makeReservation');
    await expect(page.locator('h2', { hasText: 'Nowa rezerwacja' })).toBeVisible();

    await page.selectOption('#trackSelect', { value: '1' });

    await page.fill('#resStart', '2025-09-23T10:00');
    await page.fill('#resEnd', '2025-09-23T12:00');
    await expect(page.locator('#resStart')).toHaveValue('2025-09-23T10:00');
    await expect(page.locator('#resEnd')).toHaveValue('2025-09-23T12:00');

    await page.check('#rentEquipment');
    const equipmentInput = page.locator('input[type="number"]').first();
    await equipmentInput.fill('2');

    await page.click('button:has-text("Zarezerwuj tor")');
    await expect(page).toHaveURL('/');
});

test('Pomyślna edycja rezerwacji', async ({ page }) => {
    //page.on('pageerror', err => console.log("PAGE ERROR:", err));
    //page.on('console', msg => console.log("BROWSER LOG:", msg.text()));

    await page.route('**/api/tracks', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 1, name: 'Tor', typeOfSurface: 'Twarda', length: 1000, openingHour: "08:00", closingHour: "20:00", availableDays: 'Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota,Niedziela', facilityId: 1 },
                    { id: 2, name: 'Inny', typeOfSurface: 'Miękka', length: 2000, openingHour: "10:00", closingHour: "20:00", availableDays: 'Wtorek,Środa,Czwartek,Piątek,Sobota', facilityId: 2 }
                ]),
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/tracks/1', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, name: 'Tor', typeOfSurface: 'Twarda', length: 1000, openingHour: "08:00", closingHour: "20:00", availableDays: 'Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota,Niedziela', facilityId: 1 }),
            });
        } else {
            route.continue();
        }
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

    await page.route('**/api/reservations/isAvailable?*', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ available: true }),
        });
    });

    await page.route('**/api/users/**/preferences', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    let reservations = [
        {
            id: 456,
            start: '2028-11-12T12:00:00Z',
            end: '2028-11-12T15:00:00Z',
            cost: 600,
            userId: 11,
            trackId: 1,
            statusId: 1,
            statusName: "Zarezerwowano",
            user: null,
            track: null,
            status: null,
            equipmentReservations: []
        }
    ]

    await page.route('**/api/reservations/user**', async route => {
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

    await page.route('**/api/reservations/456', async route => {
        const req = route.request();
        if (req.method() === 'PUT') {
            const body = await req.postDataJSON();
            reservations = reservations.map(r =>
                r.id === 456 ? { ...r, ...body } : r
            );
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 456, ...body }),
            });
        } else {
            route.abort();
        }
    });

    await page.goto('http://localhost:5173/myReservations');
    await expect(page.locator('h2', { hasText: 'Moje rezerwacje' })).toBeVisible();

    await page.click('button:has(img[alt="Edytuj"])');
    await expect(page.locator('label', { hasText: 'Data rozpoczęcia' })).toBeVisible();

    const newStart = '2028-11-12T14:00';
    const newEnd = '2028-11-12T18:00';
    await page.fill('input[type="datetime-local"]:nth-of-type(1)', newStart);
    await page.fill('input[type="datetime-local"]:nth-of-type(2)', newEnd);

    await page.click('button:has-text("Zapisz zmiany")');
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

    await page.route('**/api/statuses', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Zarezerwowano' }, { id: 2, name: 'Anulowano' }]),
            });
        } else {
            await route.abort();
        }
    });

    let statuses = [{ id: 1, name: "Zarezerwowano" }, { id: 2, name: "Anulowano" }];

    let reservations = [
        {
            id: 456,
            start: '2028-11-12T12:00:00Z',
            end: '2028-11-12T15:00:00Z',
            cost: 600,
            userId: 12,
            trackId: 1,
            statusId: 1,
            statusName: "Zarezerwowano",
            user: null,
            track: null,
            status: statuses[0],
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

    await page.route('**/api/reservations/456/cancel', route => {
        if (route.request().method() === 'PUT') {
            reservations[0].statusId = 2;
            reservations[0].statusName = "Anulowano";
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
    await expect(page.locator('em', { hasText: 'Tor Kartingowy Szybka Strefa' })).toBeVisible();

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć tę rezerwację?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');

    const start = formatToDatetimeLocal('2028-08-12T12:00:00Z');
    const end = formatToDatetimeLocal('2028-08-12T15:00:00Z');
    await expect(page.locator(`text=Rezerwacja: ${formatToDatetimeLocal(start)} - ${formatToDatetimeLocal(end)}`)).toHaveCount(0);
});