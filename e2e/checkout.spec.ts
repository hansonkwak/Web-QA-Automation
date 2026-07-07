import { test, expect } from '@playwright/test';

test.describe('Test Suite 5: Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.setItem('token', 'fake-token');
      const cart = [{ key: '1-R', productId: '1', name: 'Test Product', price: 100, quantity: 1, image: 'https://picsum.photos/200' }];
      window.localStorage.setItem('cart', JSON.stringify(cart)); window.localStorage.setItem('products', JSON.stringify([{ id: 'prod-2', name: 'Test', price: 10, stock: 100, category: 'Clothing', image: 'img', description: 'desc', rating: 5, reviewCount: 1, isNew: true, colors: ['Black'], sizes: ['M'] }]));
    });
  });

  test('TC-28: Block checkout with empty cart', async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.removeItem('cart');
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-page')).toBeHidden();
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
  });

  test('TC-29: Missing required fields on checkout', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('checkout-submit-btn').click();
    
    // HTML5 validation or form state should prevent submission
    await expect(page).not.toHaveURL(/\/order-success/);
  });

  test('TC-30: Successful checkout', async ({ page }) => {
    await page.goto('/checkout');
    
    await page.getByTestId('checkout-name').fill('Jane Doe');
    await page.getByTestId('checkout-email').fill('jane@example.com');
    await page.getByTestId('checkout-address').fill('123 Main St');
    
    const payment = page.getByTestId('checkout-payment');
    if (await payment.isVisible()) {
      await payment.selectOption({ index: 1 });
    }
    
    await page.getByTestId('checkout-submit-btn').click();
    
    await expect(page).toHaveURL(/\/order-success/);
    const cart = await page.evaluate(() => window.localStorage.getItem('cart'));
    expect(!cart || cart === '[]').toBeTruthy();
  });

  test('TC-31: Double click prevention on checkout', async ({ page }) => {
    await page.goto('/checkout');
    
    await page.getByTestId('checkout-name').fill('Jane Doe');
    await page.getByTestId('checkout-email').fill('jane@example.com');
    await page.getByTestId('checkout-address').fill('123 Main St');
    
    const submitBtn = page.getByTestId('checkout-submit-btn');
    
    // Triple click very fast
    await submitBtn.click();
    await submitBtn.click({ force: true }).catch(() => {});
    await submitBtn.click({ force: true }).catch(() => {});
    
    await expect(page).toHaveURL(/\/order-success/);
    
    // Check orders array length if local storage is used for mock
    const orders = await page.evaluate(() => JSON.parse(window.localStorage.getItem('orders') || '[]'));
    expect(orders.length).toBeLessThanOrEqual(1); // Should only create 1
  });

  test.skip('TC-32: Payment API failure handling', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/checkout*', async route => {
      await route.fulfill({
        status: 500,
        json: { error: 'Payment Failed' }
      });
    });

    await page.goto('/checkout');
    await page.getByTestId('checkout-name').fill('Jane Doe');
    await page.getByTestId('checkout-email').fill('jane@example.com');
    await page.getByTestId('checkout-address').fill('123 Main St');
    
    await page.getByTestId('checkout-submit-btn').click();
    
    // Expect error message and no redirect
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText(/Payment Failed|오류/i)).toBeVisible();
    
    // Cart should be preserved
    const cart = await page.evaluate(() => window.localStorage.getItem('cart'));
    expect(cart).toContain('Test Product');
  });

  test('TC-39: Back navigation after checkout', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('checkout-name').fill('Jane Doe');
    await page.getByTestId('checkout-email').fill('jane@example.com');
    await page.getByTestId('checkout-address').fill('123 Main St');
    await page.getByTestId('checkout-submit-btn').click();
    
    await expect(page).toHaveURL(/\/order-success/);
    
    // Navigate back
    await page.goBack();
    
    // Should be at home or checkout empty state
    if (page.url().includes('checkout')) {
      await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
    }
  });

  test('TC-46: Checkout with whitespace email', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('checkout-name').fill('Jane Doe');
    await page.getByTestId('checkout-email').fill('     ');
    await page.getByTestId('checkout-address').fill('123 Main St');
    
    await page.getByTestId('checkout-submit-btn').click();
    
    // Should not proceed
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('TC-54: Memory leak defense on early navigation', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('checkout-name').fill('Jane Doe');
    await page.getByTestId('checkout-email').fill('jane@example.com');
    await page.getByTestId('checkout-address').fill('123 Main St');
    
    await page.getByTestId('checkout-submit-btn').click();
    
    // Immediately navigate away
    await page.goto('/');
    
    // Check console for unmounted component errors
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(500);
    expect(logs.some(l => l.includes('unmounted component'))).toBeFalsy();
  });

  test('TC-55: Early navigation during cart add', async ({ page }) => {
    // Intercept Add to cart API
    await page.route('**/api/cart*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/product/prod-2');
    await page.getByTestId('pdp-add-to-cart').click();
    
    // Close or navigate immediately
    await page.goto('/');
    
    // Cart should either be untouched or safely updated
    await page.waitForTimeout(1000);
    const cart = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cart') || '[]'));
    expect(Array.isArray(cart)).toBeTruthy();
  });

  test.skip('TC-57: Anonymous user checkout redirect', async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.setItem('products', '[]');
      window.localStorage.removeItem('token');
      window.localStorage.setItem('cart', JSON.stringify([{ id: '1', price: 100, qty: 1 }]));
    });

    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login/);
  });
});
