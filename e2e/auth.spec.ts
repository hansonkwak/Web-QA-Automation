import { test, expect } from '@playwright/test';

test.describe('Test Suite 1: Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('TC-01: Successful user registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByTestId('register-name').fill('John Doe');
    await page.getByTestId('register-email').fill('johndoe@example.com');
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm').fill('password123');
    
    await page.getByTestId('register-submit').click();

    await expect(page).toHaveURL('/');
    
    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(token).toBeTruthy();
    
    await expect(page.getByTestId('nav-logout').or(page.getByText('Logout'))).toBeVisible();
  });

  test('TC-02: Registration with existing email', async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.setItem('users', JSON.stringify([{ email: 'test@example.com' }]));
    });

    await page.goto('/register');
    await page.getByTestId('register-name').fill('Test');
    await page.getByTestId('register-email').fill('test@example.com');
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm').fill('password123');
    await page.getByTestId('register-submit').click();

    const errorMsg = page.getByTestId('register-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText(/Email already exists/i);
  });

  test('TC-03: Registration failure on password mismatch', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByTestId('register-name').fill('John Doe');
    await page.getByTestId('register-email').fill('johndoe@example.com');
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm').fill('differentpassword');
    
    await page.getByTestId('register-submit').click();

    const errorMsg = page.getByTestId('register-error').or(page.getByText('Passwords do not match'));
    await expect(errorMsg).toBeVisible();
  });

  test('TC-04: Registration fails on empty/invalid fields (HTML5 Validation)', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByTestId('register-email').fill('invalid-email-format');
    await page.getByTestId('register-submit').click();

    // The page shouldn't redirect because of HTML5 validation
    await expect(page).toHaveURL(/\/register$/);
  });

  test('TC-05: Successful user login', async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.setItem('products', '[]');
      const users = [{ email: 'test@example.com', password: 'password123', name: 'Test User' }];
      window.localStorage.setItem('users', JSON.stringify(users));
    });

    await page.goto('/login');
    
    await page.getByTestId('login-email').fill('test@example.com');
    await page.getByTestId('login-password').fill('password123');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/');
    
    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('TC-06: Login with non-existing account', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill('unknown@example.com');
    await page.getByTestId('login-password').fill('password123');
    await page.getByTestId('login-submit').click();

    const errorMsg = page.getByTestId('login-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText(/Invalid email or password/i);
  });

  test('TC-07: Login with wrong password', async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.setItem('users', JSON.stringify([{ email: 'test@example.com', password: 'password123' }]));
    });

    await page.goto('/login');
    await page.getByTestId('login-email').fill('test@example.com');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByTestId('login-submit').click();

    const errorMsg = page.getByTestId('login-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText(/Invalid email or password/i);
  });

  test('TC-08: Logout and access control', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.setItem('token', 'fake-token');
    });

    await page.goto('/');
    await page.getByTestId('nav-logout').or(page.getByText('Logout')).click();
    
    // token should be cleared
    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(token).toBeFalsy();
    await expect(page).toHaveURL(/\/login/);
    
    // Clear storage before navigating to simulate fresh visit
    await page.evaluate(() => window.localStorage.clear());
    await page.goto('/mypage');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('TC-44: Token deletion during session', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.setItem('token', 'fake-token');
      window.localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
    });

    await page.goto('/mypage');
    // Forcibly remove token
    await page.evaluate(() => window.localStorage.removeItem('token'));
    // Trigger something that checks auth, or reload
    await page.reload();
    
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('TC-50: Registration form whitespace trimming', async ({ page }) => {
    await page.goto('/register');
    // Input only spaces
    await page.getByTestId('register-name').fill('                    ');
    await page.getByTestId('register-email').fill('test@example.com');
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm').fill('password123');
    await page.getByTestId('register-submit').click();

    // Expect to not proceed
    await expect(page).toHaveURL(/\/register$/);
  });
});
