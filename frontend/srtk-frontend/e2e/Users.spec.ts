import { test, expect } from '@playwright/test';
import { fakeJwtToken, fakeAdminJwtToken } from './Test-helper';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.addInitScript((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);
});

test('Pomyślne pobranie listy wszystkich użytkowników', async ({ page }) => {
    await page.route('**/api/users/clients', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, email: "ania@nowak.pl", name: 'Anna', surname: "Nowak", phoneNumber: "12345" }, { id: 2, email: "jan@nowak.pl", name: 'Jan', surname: "Nowak", phoneNumber: "54321" }]),
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/admins', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, email: "admin@admin.pl", facilityId: 0 }, { id: 2, email: "anna@anna.pl", facilityId: 1 }]),
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

    await page.goto('http://localhost:5173/adminPanel/usersManagement');

    await expect(page.locator('li.list-group-item >> text=ania@nowak.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=jan@nowak.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=admin@admin.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=anna@anna.pl')).toBeVisible();
})

test('Pomyślne pobranie listy adminów w danym obiekcie', async ({ page }) => {
    await page.goto('/');

    await page.addInitScript((token) => {
        localStorage.setItem('token', token);
    }, fakeAdminJwtToken);

    await page.route('**/api/users/clients', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, email: "ania@nowak.pl", name: 'Anna', surname: "Nowak", phoneNumber: "12345" }, { id: 2, email: "jan@nowak.pl", name: 'Jan', surname: "Nowak", phoneNumber: "54321" }]),
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/admins', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, email: "admin@admin.pl", facilityId: 0 }, { id: 2, email: "anna@anna.pl", facilityId: 1 }]),
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

    await page.goto('http://localhost:5173/adminPanel/usersManagement');

    await expect(page.locator('li.list-group-item >> text=ania@nowak.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=jan@nowak.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=anna@anna.pl')).toBeVisible();
})

test('Pomyślna edycja danych klienta (bez zmiany roli)', async ({ page }) => {
    await page.route('**/api/roles', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Client' }, { id: 2, name: 'Admin' }]),
            });
        } else {
            route.abort();
        }
    });

    const clientsData = [{ id: 5555, email: "ania@nowak.pl", name: "Anna", surname: "Nowak", phoneNumber: "12345" }]; // Pomocnicza tablica, gdyż po PUT nie odświeża się lista użytkowników

    await page.route('**/api/users/clients', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(clientsData)
            });
        } else {
            route.abort();
        }
    });

    await page.route('**/api/users/*', async route => {
        if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            const userIndex = clientsData.findIndex(u => u.id === 5555);
            if (userIndex !== -1) {
                clientsData[userIndex] = { ...clientsData[userIndex], ...body };
            }
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(clientsData[userIndex])
            });
        } else {
            route.abort();
        }
    });

    await page.route('**/api/users/admins', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, email: "admin@admin.pl", facilityId: 0 }, { id: 2, email: "anna@anna.pl", facilityId: 1 }]),
            });
        } else {
            route.abort();
        }
    });

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/usersManagement');

    await page.click('button:has(img[alt="Edytuj"])');

    await page.fill('input#userEmail', 'ola@nowak.pl');
    await page.selectOption('select#roleSelect', { label: 'Client' });
    await page.fill('input#userName', 'Ola');
    await page.fill('input#userSurname', 'Nowak');
    await page.fill('input#userPhone', '12345');
    await page.click('button:has-text("Zapisz zmiany")');

    await expect(page.locator('text=ola@nowak.pl')).toBeVisible();
})

test('Pomyślne usunięcie użytkownika', async ({ page }) => {
    let users = [{ id: 1235, email: "ania@nowak.pl", name: 'Anna', surname: "Nowak", phoneNumber: "12345" }];

    await page.route('**/api/users/clients', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(users)
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/admins', route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, email: "admin@admin.pl", facilityId: 0 }, { id: 2, email: "anna@anna.pl", facilityId: 1 }]),
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/users/**', async route => {
        if (route.request().method() === 'DELETE') {
            users = [];
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Usunięto użytkownika'
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

    await page.goto('http://localhost:5173/adminPanel/usersManagement');
    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć tego użytkownika?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');
    await expect(page.locator('text=ania@nowak.pl')).toHaveCount(0);
})