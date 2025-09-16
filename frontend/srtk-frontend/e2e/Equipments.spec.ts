import { test, expect } from '@playwright/test';
import { fakeJwtToken, fakeAdminJwtToken } from './Test-helper';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.addInitScript((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);
});

test('Pomyślne pobranie listy wszystkich sprzętów', async ({ page }) => {
    await page.route('**/api/equipments', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Rower', type: 'Górski', cost: 250, facilityId: 1 }, { id: 2, name: 'Kask', type: 'Kask rowerowy', cost: 50, facilityId: 2 }]),
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/equipmentsManagement');

    await expect(page.locator('li.list-group-item >> text=Rower')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=Kask')).toBeVisible();
})

test('Pomyślne pobranie listy sprzętów w danym obiekcie', async ({ page }) => {
    await page.goto('/');

    await page.addInitScript((token) => {
        localStorage.setItem('token', token);
    }, fakeAdminJwtToken);

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

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/equipmentsManagement');
    await expect(page.locator('li.list-group-item >> text=Rower')).toBeVisible();
})

test('Pomyślne dodanie nowego sprzętu', async ({ page }) => {
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

    await page.route('**/api/equipments', async route => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 133, name: 'Rower', type: 'Górski', cost: 250, facilityId: 1 }]),
            });
        } else if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 122, name: 'Kask', type: 'Górski', cost: 250, facilityId: 1 }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/equipmentsManagement');

    await page.selectOption('select#facilitySelect', { label: 'Obiekt A' });
    await page.fill('input#eqName', 'Rower');
    await page.fill('input#eqType', 'Górski');
    await page.fill('input#eqCost', '250');
    await page.click('button:has-text("Zapisz")');

    await expect(page.locator('text=Dodano sprzęt')).toBeVisible();

    await expect(page.locator('input#eqName')).toHaveValue('');
    await expect(page.locator('input#eqType')).toHaveValue('');
    await expect(page.locator('input#eqCost')).toHaveValue('0');
})

test('Pomyślna edycja toru', async ({ page }) => {
    await page.route('**/api/facilities', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Obiekt A', city: 'Białystok', address: 'ul. Zwierzyniecka' }]),
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/equipments', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Rower', type: 'Górski', cost: 250, facilityId: 1 }])
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/equipments/*', async route => {
        if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, name: body.name, type: body.type, cost: body.cost })
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/equipmentsManagement');

    await page.click('button:has(img[alt="Edytuj"])');

    await page.fill('input#eqName', 'Kask');
    await page.fill('input#eqType', 'Górski');
    await page.fill('input#eqCost', '80');
    await page.click('button:has-text("Zapisz zmiany")');

    await expect(page.locator('text=Kask')).toBeVisible();
})

test('Pomyślne usunięcie toru', async ({ page }) => {
    let equipments = [{ id: 1235, name: 'Rower', type: 'Górski', cost: 250, facilityId: 1 }];

    await page.route('**/api/equipments', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(equipments)
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/equipments/1235', async route => {
        if (route.request().method() === 'DELETE') {
            equipments = [];
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Usunięto sprzęt'
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/equipmentsManagement');

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć ten sprzęt?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');

    await expect(page.locator('text=Rower')).toHaveCount(0);
})
