const { test } = require('@playwright/test');
const { checkAccessibility } = require('../utils/a11y-helper');

/**
 * Flow 1: Identity & Access - Accessibility Audit
 * 
 * Strategy: Scan every interactive state of the Login flow.
 */
test.describe('Flow 1: Auth Accessibility Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL (ensure your dev server is running)
    await page.goto('http://localhost:5173/login');
  });

  test('Login Page - All States Compliance', async ({ page }) => {
    // 1. Initial Load State
    await checkAccessibility(page, 'Auth', 'Login-Initial-Load');

    // 2. Error State (Submit without data)
    await page.getByRole('button', { name: /sign in/i }).click();
    // Wait for the semantic role=alert to appear
    await page.getByRole('alert').first().waitFor();
    await checkAccessibility(page, 'Auth', 'Login-Validation-Errors');

    // 3. Data Entry State
    await page.getByTestId('login-email').fill('admin@test.com');
    await page.getByTestId('login-password').fill('Admin@123');
    await checkAccessibility(page, 'Auth', 'Login-Filled-Form');
  });

  test('Sign Up Page - Structural Compliance', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');
    
    // Scan initial sign up form
    await checkAccessibility(page, 'Auth', 'Signup-Initial-Load');
    
    // Scan with validation errors
    await page.getByRole('button', { name: /request otp/i }).click();
    await page.getByRole('alert').first().waitFor();
    await checkAccessibility(page, 'Auth', 'Signup-Validation-Errors');
  });
});

