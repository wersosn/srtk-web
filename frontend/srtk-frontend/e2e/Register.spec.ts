import { test, expect } from '@playwright/test'

test('Pomyślna rejestracja', async ({ page }) => {
    // Symulacja serwera:
    await page.route('**/api/auth/register', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: 'Rejestracja przebiegła pomyślnie, przekierowanie na stronę logowania',
        })
    });

    // Testowanie rejestracji:
    await page.goto('/register');

    await page.fill('input[placeholder="Email"]', 'test@test.com');
    await page.fill('input[placeholder="Imię"]', 'Test');
    await page.fill('input[placeholder="Nazwisko"]', 'Testowy');
    await page.fill('input[placeholder="Hasło"]', 'test123');
    await page.click('button:has-text("Zarejestruj się")');

    await expect(page.locator('text=Rejestracja przebiegła pomyślnie, przekierowanie na stronę logowania')).toBeVisible();
})

test('Nieprawidłowa rejestracja', async ({ page }) => {
    // Symulacja serwera:
    await page.route('**/api/auth/register', route => {
        route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: 'Wprowadzony email jest już w użyciu',
        })
    });

    // Testowanie rejestracj z już użytym mailem:
    await page.goto('/register');

    await page.fill('input[placeholder="Email"]', 'test@test.com');
    await page.fill('input[placeholder="Imię"]', 'Jan');
    await page.fill('input[placeholder="Nazwisko"]', 'Kowalski');
    await page.fill('input[placeholder="Hasło"]', 'jankowal123');
    await page.click('button:has-text("Zarejestruj się")');

    await expect(page.locator('text=Wprowadzony email jest już w użyciu')).toBeVisible();
    await expect(page).toHaveURL('/register');
})