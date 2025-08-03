import { test, expect } from '@playwright/test'
import { fakeJwtToken } from './Test-helper';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);
});

test('Pomyślne pobranie listy obiektów', async ({ page }) => {
    await page.route('**/api/facilities', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Obiekt', city: 'Białystok', address: 'ul. Zwierzyniecka' }]),
            });
        } else {
            route.continue();
        }
    });
    
    await page.goto('/adminPanel/facilitiesManagement');
    //await page.screenshot({ path: 'debug.png' });

    await expect(page.locator('li.list-group-item >> text=Obiekt')).toBeVisible();
})

test('Pomyślne dodanie nowego obiektu', async ({ page }) => {
    await page.route('**/api/facilities', async route => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{  id: 134, name: 'Mały obiekt kolarski', city: 'Białystok', address: 'ul. Zwierzyniecka' }]),
            });
        } else if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 123, name: 'Duży obiekt kolarski', city: 'Białystok', address: 'ul. Zwierzyniecka' }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.goto('/adminPanel/facilitiesManagement');

    await page.fill('input#facilityName', 'Duży obiekt kolarski');
    await page.fill('input#facilityCity', 'Białystok');
    await page.fill('input#facilityAddress', 'ul. Zwierzyniecka');
    await page.click('button:has-text("Dodaj nowy obiekt")');

    await expect(page.locator('text=Dodano obiekt')).toBeVisible();
    await expect(page.locator('input#facilityName')).toHaveValue('');
    await expect(page.locator('input#facilityCity')).toHaveValue('');
    await expect(page.locator('input#facilityAddress')).toHaveValue('');
});

test('Pomyślna edycja obiektu', async ({ page }) => {
    await page.route('**/api/facilities', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Mały obiekt kolarski', city: 'Białystok', address: 'ul. Zwierzyniecka' }])
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/facilities/*', async route => {
        if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, name: body.name, city: body.city, address: body.address })
            });
        } else {
            route.continue();
        }
    });

    await page.goto('/adminPanel/facilitiesManagement');

    await page.click('button:has(img[alt="Edytuj"])');

    await page.fill('input#facilityName', 'Duży obiekt kolarski');
    await page.fill('input#facilityCity', 'Białystok');
    await page.fill('input#facilityAddress', 'ul. Zwierzyniecka');
    await page.click('button:has-text("Zapisz zmiany")');

    await expect(page.locator('text=Duży obiekt kolarski')).toBeVisible();
});

test('Pomyślne usunięcie obiektu', async ({ page }) => {
    let facilities = [{ id: 1235, name: 'Mały obiekt kolarski', city: 'Białystok', address: 'ul. Zwierzyniecka' }];

    await page.route('**/api/facilities', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(facilities)
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/facilities/1235', async route => {
        if (route.request().method() === 'DELETE') {
            facilities = [];
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Usunięto obiekt'
            });
        } else {
            route.continue();
        }
    });

    await page.goto('/adminPanel/facilitiesManagement');

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć ten obiekt?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');
    await expect(page.locator('text=Mały obiekt kolarski')).toHaveCount(0);
});


