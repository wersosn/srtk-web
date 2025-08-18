import { test, expect } from '@playwright/test'

test('Pomyślne logowanie', async ({ page }) => {
    // Symulacja serwera:
    await page.route('**/api/auth/login', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ token: 'fake-token-123' }),
        })
    });

    // Testowanie logowania:
    await page.goto('/login');

    await page.fill('input[placeholder="Email"]', 'test@test.com');
    await page.fill('input[placeholder="Hasło"]', 'test123');
    await page.click('button:has-text("Zaloguj się")');

    await expect(page).toHaveURL('/');
})

test('Nieprawidłowe logowanie', async ({ page }) => {
    // Symulacja serwera:
    await page.route('**/api/auth/login', route => {
        route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: 'Nieprawidłowy email lub hasło',
        })
    });

    // Testowanie logowania z nieprawidłowymi danymi:
    await page.goto('/login');

    await page.fill('input[placeholder="Email"]', 'test@test.com');
    await page.fill('input[placeholder="Hasło"]', 'test321');
    await page.click('button:has-text("Zaloguj się")');

    await expect(page.locator('text=Nieprawidłowy email lub hasło')).toBeVisible();
    await expect(page).toHaveURL('/login');
})