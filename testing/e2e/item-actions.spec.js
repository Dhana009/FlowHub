const { test, expect } = require('@playwright/test');
const { checkAccessibility } = require('../utils/a11y-helper');
const { performLogin } = require('../utils/auth-utils');

test.describe('Flow 4, 5 & 6: Item Actions - View, Edit & Deactivate', () => {
  
  test.beforeEach(async ({ page }) => {
    await performLogin(page);
    await page.goto('/items');
    // Deterministic Wait: Wait for table to be ready (loading=false)
    await page.locator('[data-test-ready="true"]').waitFor({ timeout: 15000 });
  });

  test('Flow 4: Resource Inspection (Modal)', async ({ page }) => {
    // 1. Open Modal - Use the first row's view button
    const row = page.getByRole('row', { name: /item:/i }).first();
    const viewButton = row.getByRole('button', { name: /view/i });
    
    await viewButton.waitFor({ state: 'visible', timeout: 5000 });
    await viewButton.click();
    
    // Audit: Modal Loading State
    await checkAccessibility(page, 'Flow 4', 'View-Modal-Loading');

    // 2. Wait for Load
    await page.getByRole('status', { name: 'Loading item details' }).waitFor({ state: 'hidden' });
    
    // Audit: Modal Data Displayed
    await checkAccessibility(page, 'Flow 4', 'View-Modal-Open');

    // 3. Close Modal
    await page.getByTestId('close-button').click();
  });

  test('Flow 5: State Mutation (Edit)', async ({ page }) => {
    // 1. Isolation Pattern: Use the first row and ensure it is active
    const row = page.getByRole('row', { name: /item:/i }).first();
    
    // Check if we need to activate first (Consensus Pattern)
    const status = await row.getAttribute('data-test-item-status');
    if (status === 'inactive') {
      await row.getByRole('button', { name: /activate/i }).click();
      // Wait for DOM attribute to flip - more robust than waitForResponse
      await expect(row).toHaveAttribute('data-test-item-status', 'active', { timeout: 10000 });
    }
    
    const editButton = row.getByRole('button', { name: /edit/i });
    await editButton.waitFor({ state: 'visible', timeout: 10000 });
    await editButton.click();
    await expect(page).toHaveURL(/.*edit/);
    
    // Audit: Edit Form Load
    await checkAccessibility(page, 'Flow 5', 'Edit-Form-Initial');

    // 2. Version Verification
    await expect(page.getByRole('status', { name: 'Version Control Info' })).toBeVisible();
    
    // 3. Mutation Audit
    await page.getByTestId('item-name').fill(`Updated Item ${Date.now()}`);
    await checkAccessibility(page, 'Flow 5', 'Edit-Form-Changed');

    await page.getByTestId('edit-item-submit').click();
    await expect(page).toHaveURL(/.*items/);
  });

  test('Flow 6: Lifecycle Management (Deactivation)', async ({ page }) => {
    // 1. Trigger Deactivation - Use row isolation
    const row = page.getByRole('row', { name: /item:/i }).first();
    
    // Ensure the row is 'READY' for deactivation (isActive = true)
    const status = await row.getAttribute('data-test-item-status');
    if (status === 'inactive') {
      await row.getByRole('button', { name: /activate/i }).click();
      await expect(row).toHaveAttribute('data-test-item-status', 'active', { timeout: 10000 });
    }
    
    const deactivateButton = row.getByRole('button', { name: /deactivate/i });
    await deactivateButton.waitFor({ state: 'visible', timeout: 10000 });
    await deactivateButton.click();
    
    // Audit: Confirmation Modal
    // We added aria-labelledby and aria-describedby for this!
    await checkAccessibility(page, 'Flow 6', 'Deactivate-Confirm-Modal');

    // 2. Cancel Action
    await page.getByTestId('cancel-button').click();
    await expect(page.getByTestId('delete-confirm-modal')).toBeHidden();
  });
});

