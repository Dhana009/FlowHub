const { expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Enterprise A11y Scanner
 * Performs a WCAG 2.1 AA compliant scan on the current page state.
 */
async function checkAccessibility(page, flowName, stateName) {
  console.log(`[A11y Scan] Starting audit for: ${flowName} - State: ${stateName}`);
  
  // Stability Check: Wait for network idle and no aria-busy elements
  // This prevents scanning during transitions or loading flickers
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.locator('[aria-busy="true"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    // Small buffer for React rendering to settle
    await page.waitForTimeout(500); 
  } catch (e) {
    console.warn(`[A11y Scan] Stability check timed out for ${stateName}, proceeding with scan...`);
  }

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();

  // format results for better readability if violations found
  if (accessibilityScanResults.violations.length > 0) {
    console.error(`❌ Found ${accessibilityScanResults.violations.length} accessibility violations in ${flowName} (${stateName})`);
    
    accessibilityScanResults.violations.forEach(v => {
      console.error(`- [${v.impact.toUpperCase()}] ${v.help}: ${v.description}`);
      console.error(`  Reference: ${v.helpUrl}`);
      console.error(`  Nodes affected: ${v.nodes.length}`);
    });
  } else {
    console.log(`✅ No accessibility violations found in ${flowName} - ${stateName}`);
  }

  // Final assertion for the test runner
  expect(accessibilityScanResults.violations, `A11y Check Failed: ${flowName} (${stateName})`).toEqual([]);
  
  return accessibilityScanResults;
}

module.exports = { checkAccessibility };

