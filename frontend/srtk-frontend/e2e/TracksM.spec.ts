import { test, expect } from '@playwright/test';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const fakeJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjExIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYWRtaW5AYWRtaW4ucGwiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImp0aSI6ImM1YjEwNjQzLTFjYWQtNDVhMi1hZjUxLWVhOTgyOGM1NjQxMSIsIkZhY2lsaXR5SWQiOiIwIiwiZXhwIjoxNzU0MTQ1MzgxLCJpc3MiOiJzcnRrLWJhY2tlbmQiLCJhdWQiOiJzcnRrLWNsaWVudHMifQ.signature-placeholder';

    await page.evaluate((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);
});

test('Pomyślne pobranie listy wszystkich torów', async ({ page }) => {
    await page.route('**/api/tracks', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Tor', typeOfSurface: 'Twarda', length: 1000, facilityId: 1 }, { id: 2, name: 'Inny', typeOfSurface: 'Miękka', length: 2000, facilityId: 2 }]),
            });
        } else {
            route.continue();
        }
    });
    
    await page.goto('/adminPanel/tracksManagement');

    await expect(page.locator('li.list-group-item >> text=Tor')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=Inny')).toBeVisible();
})

test('Pomyślne pobranie listy torów w danym obiekcie', async ({ page }) => {
    await page.goto('/');
    const fakeAdminJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhbm5hQGFubmEucGwiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImp0aSI6ImYyMTVlM2Q2LWExZTgtNDNmZi1iNjdhLTc1MzEyNWYwNWVhZiIsIkZhY2lsaXR5SWQiOiIxIiwiZXhwIjoxNzU0MTQ3Mjk4LCJpc3MiOiJzcnRrLWJhY2tlbmQiLCJhdWQiOiJzcnRrLWNsaWVudHMifQ.signature-placeholder';

    await page.evaluate((token) => {
        localStorage.setItem('token', token);
    }, fakeAdminJwtToken);
    
    await page.route('**/api/tracks/inFacility?facilityId=1', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Tor', typeOfSurface: 'Twarda', length: 1000, facilityId: 1 }]),
            });
        } else {
            route.continue();
        }
    });

    await page.goto('/adminPanel/tracksManagement');

    await expect(page.locator('li.list-group-item >> text=Tor')).toBeVisible();
});

test('Pomyślne dodanie nowego toru', async ({ page }) => {
    await page.route('**/api/facilities', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Obiekt A', city: 'Białystok', address: 'ul. Zwierzyniecka' }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.route('**/api/tracks', async route => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 132, name: 'Inny', typeOfSurface: 'Żwir', length: 5000, facilityId: 1 }]),
            });
        } else if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 123, name: 'Tor', typeOfSurface: 'Żwir', length: 5000, facilityId: 1 }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.goto('/adminPanel/tracksManagement');

    await page.selectOption('select#facilitySelect', { label: 'Obiekt A' });
    await page.fill('input#trackName', 'Inny');
    await page.fill('input#trackType', 'Żwir');
    await page.fill('input#trackLength', '5000');
    await page.click('button:has-text("Dodaj nowy tor")');

    await expect(page.locator('text=Dodano tor')).toBeVisible();

    await expect(page.locator('input#trackName')).toHaveValue('');
    await expect(page.locator('input#trackType')).toHaveValue('');
    await expect(page.locator('input#trackLength')).toHaveValue('0');
});

test('Pomyślna edycja toru', async ({ page }) => {
    await page.route('**/api/facilities', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Obiekt A', city: 'Białystok', address: 'ul. Zwierzyniecka' }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.route('**/api/tracks', async route => {
        if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 123, name: body.name, typeOfSurface: body.typeOfSurface, length: body.length, facilityId: 1 }]),
            });
        } else if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 123, name: 'Tor', typeOfSurface: 'Żwir', length: 5000, facilityId: 1 }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.goto('/adminPanel/tracksManagement');

    await page.click('button:has(img[alt="Edytuj"])');

    await page.fill('input#trackName', 'Tor kolarski');
    await page.fill('input#trackType', 'Żwir');
    await page.fill('input#trackLength', '7000');
    await page.click('button:has-text("Zapisz zmiany")');

    await expect(page.locator('text=Tor kolarski')).toBeVisible();
});

test('Pomyślne usunięcie toru', async ({ page }) => {
    let tracks = [{ id: 1235, name: 'Testowy', typeOfSurface: 'Żwir', length: 5000, facilityId: 1 }];

    await page.route('**/api/tracks', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(tracks)
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/tracks/1235', async route => {
        if (route.request().method() === 'DELETE') {
            tracks = [];
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Usunięto tor'
            });
        } else {
            route.continue();
        }
    });

    await page.goto('/adminPanel/tracksManagement');

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć ten tor?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');

    await expect(page.locator('text=Testowy')).toHaveCount(0);
});