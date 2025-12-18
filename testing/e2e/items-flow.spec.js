const { test, expect } = require('@playwright/test');
const { checkAccessibility } = require('../utils/a11y-helper');
const { performLogin } = require('../utils/auth-utils');

test.describe('Flow 2 & 3: Item Lifecycle - Creation & Discovery', () => {
  
  test.beforeEach(async ({ page }) => {
    await performLogin(page);
  });

  test('Flow 2: Item Ingestion journey', async ({ page }) => {
    // 1. Sidebar Navigation
    await page.getByTestId('sidebar-create-item-button').click();
    await expect(page).toHaveURL(/.*items\/create/);
    
    // Audit: Empty Creation Form
    await checkAccessibility(page, 'Flow 2', 'Creation-Form-Initial');

    // 2. Trigger Validation
    await page.getByTestId('create-item-submit').click();
    await page.getByRole('alert').first().waitFor();
    
    // Audit: Validation Error State
    await checkAccessibility(page, 'Flow 2', 'Creation-Form-Validation-Errors');

    // 3. Fill Form (Successful Path)
    await page.getByTestId('item-name').fill(`Auto Item ${Date.now()}`);
    await page.getByTestId('item-description').fill('Semantic testing description');
    await page.getByTestId('item-type').selectOption('DIGITAL');
    await page.getByTestId('item-download-url').fill('https://test.com/file.zip');
    await page.getByTestId('item-file-size').fill('1024');
    await page.getByTestId('item-price').fill('99.99');
    await page.getByTestId('item-category').fill('Automation');
    
    // Audit: Filled Form (Ready to Submit)
    await checkAccessibility(page, 'Flow 2', 'Creation-Form-Ready');

    await page.getByTestId('create-item-submit').click();
    
    // Wait for redirect back to list
    await expect(page).toHaveURL(/.*items/);
  });

  test('Flow 3: Search & Discovery grid', async ({ page }) => {
    await page.goto('/items');
    
    // Audit: Initial Items Grid
    await checkAccessibility(page, 'Flow 3', 'Inventory-Grid-Initial');

    // 1. Search Interaction
    const searchInput = page.getByTestId('item-search');
    const query = 'NoItemsShouldMatchThisSpecificRandomString';
    
    await searchInput.fill(query);
    
    // Deterministic Wait: Wait for the search state to be 'ready' AND the last finished search to match our query
    await page.waitForFunction((expectedQuery) => {
      const input = document.querySelector('[data-testid="item-search"]');
      const table = document.querySelector('[data-test-items-count]');
      
      const state = input?.getAttribute('data-test-search-state');
      const lastSearch = input?.getAttribute('data-test-last-search');
      const count = parseInt(table?.getAttribute('data-test-items-count') || '-1');
      
      // We want the search to be finished, the query to match, and the count to be 0
      return state === 'ready' && lastSearch === expectedQuery && count === 0;
    }, query, { timeout: 20000 });
    
    // 2. Empty State
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('empty-state')).toContainText(/No items match|No items found/i);
    
    // Audit: Empty Search Results State
    await checkAccessibility(page, 'Flow 3', 'Inventory-Grid-Empty-Results');

    // 3. Filter Interaction
    await page.getByTestId('search-clear').click();
    await page.getByTestId('filter-status').selectOption('active');
    await checkAccessibility(page, 'Flow 3', 'Inventory-Grid-Filtered');
  });
});

