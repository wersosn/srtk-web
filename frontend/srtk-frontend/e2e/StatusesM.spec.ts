import { test, expect } from '@playwright/test'
import { fakeJwtToken } from './Test-helper';

// Ustawienie mockowego tokena:
test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);
});

test('Pomyślne pobranie listy statusów rezerwacji', async ({ page }) => {
     await page.route('**/api/statuses', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Anulowano' }]),
            });
        } else {
            await route.abort();
        }
    });
    
    await page.goto('/adminPanel/statusesManagement');

    await expect(page.locator('text=Anulowano')).toBeVisible();
});

test('Pomyślne dodanie nowego statusu', async ({ page }) => {
    await page.route('**/api/statuses', async route => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 123, name: 'Anulowano' }),
            });
        } else if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Anulowano' }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.goto('/adminPanel/statusesManagement');

    await page.fill('input#statusName', 'Anulowano');
    await page.click('button:has-text("Dodaj nowy status")');

    await expect(page.locator('text=Dodano status')).toBeVisible();
    const inputValue = await page.inputValue('input#statusName');
    expect(inputValue).toBe('');
});

test('Pomyślna edycja statusu rezerwacji', async ({ page }) => {
    await page.route('**/api/statuses', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 3, name: 'Anulowano' }]),
            });
        } else {
            await route.abort();
        }
    });

    await page.route('**/api/statuses/*', async route => {
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

    await page.goto('/adminPanel/statusesManagement');

    await page.click('button:has(img[alt="Edytuj"])');

    await page.fill('input#statusName', 'Zmodyfikowano');
    await page.click('button:has-text("Zapisz zmiany")');

    await expect(page.locator('text=Zmodyfikowano')).toBeVisible();
});

test('Pomyślne usunięcie statusu rezerwacji', async ({ page }) => {
    let statuses = [{ id: 1235, name: 'Anulowano' }];

    await page.route('**/api/statuses', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(statuses),
            });
        } else {
            await route.abort();
        }
    });

    await page.route('**/api/statuses/1235', async route => {
        if (route.request().method() === 'DELETE') {
            statuses = [];
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Usunięto status',
            });
        } else {
            await route.abort();
        }
    });

    await page.goto('/adminPanel/statusesManagement');

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć ten status?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');
    await expect(page.locator('text=Anulowano')).toHaveCount(0);
});
