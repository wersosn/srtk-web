import { test, expect } from '@playwright/test'

// Ustawienie mockowego tokena i listy statusów:
test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const fakeJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjExIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYWRtaW5AYWRtaW4ucGwiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImp0aSI6ImM1YjEwNjQzLTFjYWQtNDVhMi1hZjUxLWVhOTgyOGM1NjQxMSIsIkZhY2lsaXR5SWQiOiIwIiwiZXhwIjoxNzU0MTQ1MzgxLCJpc3MiOiJzcnRrLWJhY2tlbmQiLCJhdWQiOiJzcnRrLWNsaWVudHMifQ.signature-placeholder';

    await page.evaluate((token) => {
        localStorage.setItem('token', token);
    }, fakeJwtToken);

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
});

test('Pomyślne pobranie listy statusów rezerwacji', async ({ page }) => {
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
                body: JSON.stringify([{ id: 1, name: 'Anulowano' }]),
            });
        } else if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, name: body.name }),
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
