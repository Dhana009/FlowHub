const { expect } = require('@playwright/test');

/**
 * Perform a standard login for testing
 */
async function performLogin(page, email = 'admin@test.com', password = 'Admin@123') {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for the dashboard or navigation to confirm login
  await expect(page).toHaveURL(/.*dashboard/);
  console.log(`[Test Setup] Logged in as: ${email}`);
}

module.exports = { performLogin };





