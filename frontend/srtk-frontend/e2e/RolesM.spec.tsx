import { test, expect } from '@playwright/test'

// Logowanie admina do testów (wymaga włączonego serwera!):
test.beforeEach(async ({ page }) => {
    const response = await page.request.post('/api/auth/login', {
        data: { email: 'admin@admin.pl', password: 'admin123' }
    });
    if (!response.ok()) {
        const errorText = await response.text();
        throw new Error('Błąd logowania: ' + errorText);
    }

    const data = await response.json();
    const token = data.token;

    await page.goto('/');
    await page.evaluate((token) => {
        localStorage.setItem('token', token);
    }, token);
});

test('Pomyślne dodanie nowej roli', async ({ page }) => {
    // Symulacja serwera:
    await page.route('**/api/roles', route => {
        if (route.request().method() === 'POST') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 123, name: 'Moderator' }),
            });
        } else {
            route.continue();
        }
    });

    await page.goto('/adminPanel/roleManagement');
    await page.screenshot({ path: 'debug.png' });

    await page.fill('input#roleName', 'Moderator');
    await page.click('button:has-text("Dodaj nową rolę")');

    await expect(page.locator('text=Dodano rolę')).toBeVisible();
    const inputValue = await page.inputValue('input#roleName, input:has-text("Nazwa")');
    expect(inputValue).toBe('');
})

test('Pomyślna edycja roli', async ({ page }) => {
    // Symulacja serwera:
    await page.route('**/api/roles', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, name: 'Moderator' }])
            });
        } else if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, name: body.name })
            });
        } else {
            route.continue();
        }
    });

    await page.goto('/adminPanel/roleManagement');
    await page.screenshot({ path: 'debug.png' });

    await page.click('button:has(img[alt="Edytuj"])');

    await page.fill('input#roleName', 'Owner');
    await page.click('button:has-text("Zapisz zmiany")');

    await expect(page.locator('text=Owner')).toBeVisible();
})

test('Pomyślne usunięcie roli', async ({ page }) => {
    let roles = [{ id: 1235, name: 'Mod' }];

    await page.route('**/api/roles', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(roles)
            });
        } else {
            route.continue();
        }
    });

    await page.route('**/api/roles/1235', async route => {
        if (route.request().method() === 'DELETE') {
            roles = [];
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Usunięto rolę'
            });
        } else {
            route.continue();
        }
    });

    await page.goto('/adminPanel/roleManagement');

    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć tę rolę?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');
    await expect(page.locator('text=Mod')).toHaveCount(0);
});


