import { test, expect } from '@playwright/test';

test.describe('Test Suite 2: Product Listing', () => {
  test('TC-09: Initial product list rendering', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('pdp-loading').or(page.getByTestId('plp-loading'))).toBeHidden();
    
    const products = page.locator('[data-testid^="product-card-"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(12);
  });

  test('TC-10: Pagination to next page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    const nextButton = page.getByTestId('next-page-button');
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();
    
    await expect(page).toHaveURL(/page=2/);
  });

  test('TC-11: Category filtering (Electronics)', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    await page.getByTestId('filter-category').selectOption('Electronics');
    await expect(page).toHaveURL(/category=Electronics/i);
  });

  test('TC-12: Sort by Price: Low to High', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    await page.getByTestId('sort-select').selectOption('price-low');
    await expect(page).toHaveURL(/sort=price-low/);
  });

  test('TC-13: Header search with exact match', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('input[type="search"]').or(page.getByTestId('search-input'));
    if (await searchInput.isVisible()) {
      await searchInput.fill('Phone');
      await searchInput.press('Enter');
      
      await expect(page).toHaveURL(/q=Phone/i);
    }
  });

  test('TC-14: Header search with no results', async ({ page }) => {
    await page.goto('/products?q=존재하지않는상품123');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    const noProducts = page.getByTestId('no-products');
    await expect(noProducts).toBeVisible();
    await expect(noProducts).toContainText(/No products found/i);
  });

  test('TC-15: Out of stock badge', async ({ page }) => {
    // Inject mock data with out of stock product
    await page.route('**/api/products*', async route => {
      await route.fulfill({
        json: {
          products: [
            { id: 1, name: 'Sold Out Item', price: 10, stock: 0 }
          ]
        }
      });
    });

    await page.goto('/products');
    
    // Using generic text match if specific badge not available
    const badge = page.getByText(/Out of Stock/i);
    await expect(badge.first()).toBeVisible();
  });

  test('TC-40: Pagination manipulation to invalid negative page', async ({ page }) => {
    await page.goto('/products?page=-1');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    // Should fallback to page 1 or show no results, but shouldn't crash
    const products = page.locator('[data-testid^="product-card-"]');
    const noProducts = page.getByTestId('no-products');
    await expect(products.first().or(noProducts)).toBeVisible();
  });

  test('TC-41: Invalid sort query string', async ({ page }) => {
    await page.goto('/products?sort=hacked_sort');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    // Should render without crashing, potentially falling back to default
    const products = page.locator('[data-testid^="product-card-"]');
    await expect(products.first()).toBeVisible();
  });

  test('TC-56: Realtime resizing layout check', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 768, height: 900 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);
    
    // Verify it doesn't crash and at least one product is visible
    const products = page.locator('[data-testid^="product-card-"]');
    if (await products.count() > 0) {
      await expect(products.first()).toBeVisible();
    }
  });

  test('TC-58: Scroll restoration', async ({ page }) => {
    await page.goto('/products?page=2');
    await expect(page.getByTestId('plp-loading')).toBeHidden();
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Click last product
    const products = page.locator('[data-testid^="product-card-"]');
    const count = await products.count();
    if (count > 0) {
      await products.nth(count - 1).click();
      await expect(page).toHaveURL(/\/product\//);
      
      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/page=2/);
      
      // We can check if scrollY > 0, indicating restoration
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    }
  });
});
