const { test, expect } = require('@playwright/test');
const { checkAccessibility } = require('../utils/a11y-helper');
const { performLogin } = require('../utils/auth-utils');

test.describe('Flow 7: Bulk Operations Infrastructure', () => {
  
  test.beforeEach(async ({ page }) => {
    await performLogin(page);
    await page.goto('/items');
  });

  test('Should be accessible during full bulk lifecycle', async ({ page }) => {
    // 1. Selection State - Using the hardened "Select All" header
    await page.getByTestId('select-all-checkbox').click();
    
    // Audit: Floating Toolbar (Region Region)
    await checkAccessibility(page, 'Flow 7', 'Bulk-Toolbar-Visible');

    // 2. Trigger Operation
    await page.getByTestId('bulk-deactivate-button').click();
    
    // Wait for modal to appear
    await page.getByTestId('bulk-operation-modal').waitFor();

    // Audit: Progress Modal (Processing State)
    // It might be 'Preparing Job' or 'Processing items' - let's just wait for the progress bar to exist
    await page.getByRole('progressbar').waitFor({ timeout: 10000 }).catch(() => {});
    await checkAccessibility(page, 'Flow 7', 'Bulk-Modal-Processing');

    // 3. Completion State
    // Deterministic Wait: Wait for backend status to flip to 'completed'
    await page.locator('[data-test-job-status="completed"]').waitFor({ timeout: 30000 });
    
    // Audit: Summary Report
    await checkAccessibility(page, 'Flow 7', 'Bulk-Modal-Summary-Report');

    await page.getByTestId('close-modal-button').click();
  });
});

