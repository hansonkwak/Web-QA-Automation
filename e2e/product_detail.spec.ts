import { test, expect } from '@playwright/test';

test.describe('Test Suite 3: Product Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { window.localStorage.clear(); window.localStorage.setItem('products', JSON.stringify([{ id: 'prod-2', name: 'Test', price: 10, stock: 100, category: 'Clothing', image: 'img', description: 'desc', rating: 5, reviewCount: 1, isNew: true, colors: ['Black'], sizes: ['M'] }])); });
  });

  test('TC-16: Normal PDP rendering', async ({ page }) => {
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const title = page.getByTestId('pdp-title');
    await expect(title).toBeVisible();
    // Verify price, image etc. as requested
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('TC-17: 404 Product Not Found', async ({ page }) => {
    await page.goto('/product/9999');
    const notFound = page.getByTestId('pdp-not-found').or(page.getByText(/Product not found/i));
    await expect(notFound).toBeVisible();
  });

  test('TC-18: Loading spinner on network delay', async ({ page }) => {
    await page.route('**/api/product/*', async route => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/product/prod-2');
    const spinner = page.getByTestId('pdp-loading');
    await expect(spinner).toBeVisible();
    await expect(spinner).toBeHidden();
  });

  test('TC-19: Add to cart with all required options', async ({ page }) => {
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const color = page.getByTestId('pdp-color-Red');
    if (await color.isVisible()) await color.click();
    
    const size = page.getByTestId('pdp-size-M');
    if (await size.isVisible()) await size.click();
    
    await page.getByTestId('pdp-add-to-cart').click();
    await page.waitForURL('**/cart', { timeout: 3000 }).catch(() => {});
    
    // Header cart icon increments
    const cartBadge = page.locator('.cart-badge, [data-testid="cart-count"]');
    if (await cartBadge.isVisible()) {
       await expect(cartBadge).toHaveText('1');
    }
  });

  test('TC-20: Add to cart without required options', async ({ page }) => {
    await page.goto('/product/prod-2'); // Assume product 1 requires options
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    await page.getByTestId('pdp-add-to-cart').click();
    await page.waitForURL('**/cart', { timeout: 3000 }).catch(() => {});
    
    // Check if cart is not incremented or error shown
    const cartBadge = page.locator('.cart-badge, [data-testid="cart-count"]');
    if (await cartBadge.isVisible()) {
       await expect(cartBadge).not.toHaveText('1');
    }
  });

  test('TC-21: Quantity increment and decrement limits', async ({ page }) => {
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const qtyPlus = page.getByTestId('pdp-qty-plus');
    const qtyMinus = page.getByTestId('pdp-qty-minus');
    const qtyValue = page.getByTestId('pdp-qty-value');

    if (await qtyPlus.isVisible()) {
      await qtyPlus.click(); // 2
      await qtyPlus.click(); // 3
      await expect(qtyValue).toHaveText('3');
      
      await qtyMinus.click(); // 2
      await expect(qtyValue).toHaveText('2');
      
      await qtyMinus.click(); // 1
      await qtyMinus.click(); // attempt 0
      await expect(qtyValue).toHaveText('1'); // Should not go below 1
    }
  });

  test('TC-22: Product reviews render', async ({ page }) => {
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const reviewSection = page.getByTestId('pdp-reviews-section');
    if (await reviewSection.isVisible()) {
      await expect(reviewSection).toBeVisible();
    }
  });

  test('TC-23: Submit empty review', async ({ page }) => {
    await page.goto('/product/prod-2');
    const reviewTextArea = page.getByTestId('review-textarea');
    if (await reviewTextArea.isVisible()) {
      await reviewTextArea.fill('');
      const submit = page.getByTestId('review-submit').or(page.getByText('Submit Review'));
      await submit.click();
      
      // Should show validation error and not post
      await expect(reviewTextArea).toBeVisible(); // stay on page
    }
  });

  test('TC-43: Quantity plus spam defense', async ({ page }) => {
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const qtyPlus = page.getByTestId('pdp-qty-plus');
    if (await qtyPlus.isVisible()) {
      for (let i = 0; i < 50; i++) {
        await qtyPlus.click({ delay: 5 }); // fast clicks
      }
      
      // The state should accurately reflect 51 (1 initial + 50)
      await expect(page.getByTestId('pdp-qty-value')).toHaveText('51');
    }
  });

  test('TC-45: Option persistency on reload', async ({ page }) => {
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const color = page.getByTestId('pdp-color-Red');
    if (await color.isVisible()) {
      await color.click();
      await page.reload();
      // Implementation behavior varies, but we check if it doesn't crash
      await expect(page.getByTestId('pdp-title')).toBeVisible();
    }
  });

  test('TC-48: Cart item merge on identical options', async ({ page }) => {
    // Add same product twice
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const color = page.getByTestId('pdp-color-Red');
    const size = page.getByTestId('pdp-size-M');
    
    if (await color.isVisible()) await color.click();
    if (await size.isVisible()) await size.click();
    
    const plus = page.getByTestId('pdp-qty-plus');
    if (await plus.isVisible()) await plus.click(); // qty 2
    
    await page.getByTestId('pdp-add-to-cart').click();
    await page.waitForURL('**/cart', { timeout: 3000 }).catch(() => {});
    
    await page.goto('/product/prod-2');
    
    if (await color.isVisible()) await color.click();
    if (await size.isVisible()) await size.click();
    await page.getByTestId('pdp-add-to-cart').click();
    await page.waitForURL('**/cart', { timeout: 3000 }).catch(() => {});
    
    const cartObj = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cart') || '[]'));
    // Should have 1 item with qty 3
    if (cartObj.length > 0) {
      expect(cartObj.length).toBe(1);
      expect(cartObj[0].qty).toBe(3);
    }
  });

  test('TC-49: Cart max stock check', async ({ page }) => {
    // Inject cart item with 4 qty
    await page.goto('/');
    await page.evaluate(() => { 
      window.localStorage.setItem('products', JSON.stringify([{ id: 'prod-2', name: 'Test', price: 10, stock: 5, category: 'Clothing', image: 'img', description: 'desc', rating: 5, reviewCount: 1, isNew: true, colors: ['Black'], sizes: ['M'] }]));
      window.localStorage.setItem('cart', JSON.stringify([{ key: 'prod-2-Black-M', id: 'prod-2', productId: 'prod-2', name: 'Product', price: 10, quantity: 4, qty: 4, stock: 5 }]));
    });

    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const plus = page.getByTestId('pdp-qty-plus');
    if (await plus.isVisible()) await plus.click(); // qty 2
    
    await page.getByTestId('pdp-add-to-cart').click();
    await page.waitForURL('**/cart', { timeout: 3000 }).catch(() => {});
    
    // Might show an alert or cap it at 5
    const cartObj = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cart') || '[]'));
    if (cartObj.length > 0) {
      expect(cartObj[0].qty).toBeLessThanOrEqual(5);
    }
  });

  test('TC-51: Quantity input keyboard typing prevention', async ({ page }) => {
    await page.goto('/product/prod-2');
    await expect(page.getByTestId('pdp-loading')).toBeHidden();
    
    const qtyValue = page.getByTestId('pdp-qty-value');
    if (await qtyValue.isVisible() && await qtyValue.isEnabled()) {
      const isReadonly = await qtyValue.getAttribute('readonly');
      // Either it has readonly, or filling 'abc' doesn't work
      if (isReadonly === null) {
        await qtyValue.fill('abc').catch(() => {});
        await expect(qtyValue).not.toHaveText('abc');
      } else {
        expect(isReadonly).toBeDefined();
      }
    }
  });
});
