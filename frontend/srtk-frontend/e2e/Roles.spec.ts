import { test, expect } from '@playwright/test'
import { fakeJwtToken } from './Test-helper';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');
 
    await page.addInitScript((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);
});

test('Pomyślne pobranie listy ról', async ({ page }) => {
    await page.route('**/api/roles', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 1, name: 'Client' },
                    { id: 2, name: 'Admin' }
                ]),
            });
        }
    });

    await page.route('**/api/users/**/preferences', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ userId: 11, elementsPerPage: 10 }),
        });
    });

    await page.goto('http://localhost:5173/adminPanel/roleManagement');
    await expect(page.locator('li.list-group-item')).toHaveCount(2);
    await expect(page.locator('li.list-group-item >> text=Client')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=Admin')).toBeVisible();
});

test('Pomyślne dodanie nowej roli', async ({ page }) => {
    await page.route('**/api/roles', async route => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 123, name: 'Moderator' }),
            });
        } else if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Client' }, { id: 2, name: 'Admin' }]),
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

    await page.goto('http://localhost:5173/adminPanel/roleManagement');
    await page.fill('input#roleName', 'Moderator');
    await page.click('button:has-text("Zapisz")');

    await expect(page.locator('text=Dodano rolę')).toBeVisible();
    const inputValue = await page.inputValue('input#roleName');
    expect(inputValue).toBe('');
});

test('Pomyślna edycja roli', async ({ page }) => {
    await page.route('**/api/roles', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 3, name: 'Moderator' }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.route('**/api/roles/*', async route => {
        if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 3, name: body.name }),
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

    await page.goto('http://localhost:5173/adminPanel/roleManagement');
    await page.click('button:has(img[alt="Edytuj"])');

    await page.fill('input#roleName', 'Owner');
    await page.click('button:has-text("Zapisz zmiany")');

    await expect(page.locator('text=Owner')).toBeVisible();
});

test('Pomyślne usunięcie roli', async ({ page }) => {
    let roles = [{ id: 1235, name: 'Mod' }];

    await page.route('**/api/roles', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(roles),
            });
        } else {
            await route.abort();
        }
    });

    await page.route('**/api/roles/1235', async route => {
        if (route.request().method() === 'DELETE') {
            roles = [];
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Usunięto rolę',
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

    await page.goto('http://localhost:5173/adminPanel/roleManagement');
    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć tę rolę?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');
    await expect(page.locator('text=Mod')).toHaveCount(0);
});


