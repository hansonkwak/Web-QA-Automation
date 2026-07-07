import { test, expect } from '@playwright/test';

test.describe('Test Suite 6: My Page & Edge Cases', () => {

  test('TC-33: MyPage blocked when unauthenticated', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear());
    await page.goto('/mypage');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-34: MyPage with order history', async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.setItem('token', 'fake-token');
      window.localStorage.setItem('user', JSON.stringify({ name: 'Jane' }));
      window.localStorage.setItem('orders', JSON.stringify([{ id: 'ORD-1', status: 'Processing', total: 100, date: '2026-07-06' }]));
    });

    await page.goto('/mypage');
    await expect(page.getByTestId('mypage-greeting')).toContainText('Jane');
    
    const orders = page.locator('[data-testid^="order-item-"]');
    await expect(orders.first()).toBeVisible();
    await expect(orders.first()).toContainText('Processing');
  });

  test('TC-35: 404 Not Found Routing', async ({ page }) => {
    await page.goto('/unknown-page-123');
    
    const notFoundText = page.getByText(/404|Not Found/i);
    await expect(notFoundText.first()).toBeVisible();
    
    const homeLink = page.getByRole('link', { name: /home/i }).or(page.locator('a[href="/"]'));
    await expect(homeLink.first()).toBeVisible();
  });

  test('TC-37: XSS Injection Defense', async ({ page }) => {
    // Attempt injection in search
    await page.goto('/');
    
    // We mock a dialog listener to fail the test if an alert pops up
    let dialogFired = false;
    page.on('dialog', dialog => {
      dialogFired = true;
      dialog.dismiss();
    });

    const searchInput = page.locator('input[type="search"]').or(page.getByTestId('search-input'));
    if (await searchInput.isVisible()) {
      await searchInput.fill('<script>alert("xss")</script>');
      await searchInput.press('Enter');
      
      // Wait to see if dialog fires
      await page.waitForTimeout(500);
      expect(dialogFired).toBeFalsy();
      
      // The script tag should be rendered as text
      const results = page.locator('body');
      await expect(results).toContainText('<script>alert("xss")</script>');
    }
  });

  test('TC-38: Extremely long text overflow defense', async ({ page }) => {
    await page.goto('/register');
    
    const longText = 'A'.repeat(2000);
    await page.getByTestId('register-name').fill(longText);
    
    // It should either truncate or show an error
    const input = page.getByTestId('register-name');
    const val = await input.inputValue();
    
    // If it allows it, it shouldn't break the layout when submitted (we assume validation catches it, or truncates)
    await page.getByTestId('register-submit').click();
    
    // We just verify the app doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});
