const { test, expect } = require('@playwright/test');
const { checkAccessibility } = require('../utils/a11y-helper');
const { performLogin } = require('../utils/auth-utils');

test.describe('Flow 8, 9 & 10: Admin & Governance Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    await performLogin(page); // Standard Admin Login
  });

  test('Flow 9: System Activity Audit Logs', async ({ page }) => {
    await page.goto('/activity-logs');
    
    // Audit: Full Activity Grid
    // We added comprehensive row labels for this!
    await checkAccessibility(page, 'Flow 9', 'Activity-Logs-Grid');
  });

  test('Flow 10: Admin User Management Plane', async ({ page }) => {
    await page.goto('/users');
    
    // Audit: User Management Table
    await checkAccessibility(page, 'Flow 10', 'User-Management-Grid');

    // 1. Role Change State - Skip the first row if it's the admin themselves
    // We'll look for a row where the select is NOT disabled
    const roleSelects = page.getByRole('combobox', { name: /change role for/i });
    const count = await roleSelects.count();
    let targetSelect = null;
    
    for (let i = 0; i < count; i++) {
      const select = roleSelects.nth(i);
      if (await select.isEnabled()) {
        targetSelect = select;
        break;
      }
    }

    if (!targetSelect) {
      throw new Error('No enabled role selector found. Need at least one other user in the system.');
    }

    await targetSelect.selectOption('EDITOR');
    
    // Audit: Spinner feedback
    await page.getByRole('status', { name: 'Updating role' }).waitFor();
    await checkAccessibility(page, 'Flow 10', 'User-Role-Updating');
  });

  test('Flow 8: RBAC Visibility Audit (Admin View)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Audit: Header Role Badge
    await expect(page.getByLabel(/current role: ADMIN Access/i)).toBeVisible();
    await checkAccessibility(page, 'Flow 8', 'Dashboard-Admin-Role');
  });
});

