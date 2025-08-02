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

    await page.goto('/adminPanel/usersManagement');

    await expect(page.locator('li.list-group-item >> text=ania@nowak.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=jan@nowak.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=admin@admin.pl')).toBeVisible();
    await expect(page.locator('li.list-group-item >> text=anna@anna.pl')).toBeVisible();
})



test('Pomyślne pobranie listy adminów w danym obiekcie', async ({ page }) => {
    await page.goto('/');
    const fakeAdminJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhbm5hQGFubmEucGwiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImp0aSI6ImYyMTVlM2Q2LWExZTgtNDNmZi1iNjdhLTc1MzEyNWYwNWVhZiIsIkZhY2lsaXR5SWQiOiIxIiwiZXhwIjoxNzU0MTQ3Mjk4LCJpc3MiOiJzcnRrLWJhY2tlbmQiLCJhdWQiOiJzcnRrLWNsaWVudHMifQ.signature-placeholder';

    await page.evaluate((token) => {
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

    await page.goto('/adminPanel/usersManagement');

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
            route.continue();
        }
    });

    await page.route('**/api/users/clients', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 1, email: "ania@nowak.pl", name: 'Anna', surname: "Nowak", phoneNumber: "12345" }])
            });
        } else if (route.request().method() === 'PUT') {
            const body = await route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, email: body.email, name: body.name, surname: body.surname, phoneNumber: body.phoneNumber })
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

    await page.goto('/adminPanel/usersManagement');

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

    await page.goto('/adminPanel/usersManagement');
    page.once('dialog', dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Czy na pewno chcesz usunąć tego użytkownika?');
        dialog.accept();
    });

    await page.click('button:has(img[alt="Usuń"])');
    await expect(page.locator('text=ania@nowak.pl')).toHaveCount(0);
})