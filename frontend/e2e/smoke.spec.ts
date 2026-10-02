import { expect, test } from '@playwright/test'

// Section 11.4 -- browser E2E smoke suite. Runs against the real local backend (must be running
// at http://127.0.0.1:8000) and a real local frontend dev server. No mocked "happy path" data --
// every assertion below reads whatever the live API actually returns, except test 16 which
// deliberately forces one API call to fail to verify the error state renders correctly.

test('1. Landing page loads', async ({ page }) => {
  await page.goto('/')
  // Hero copy updated in the visual redesign ("Turning flexible demand into grid capacity.");
  // selector updated to match -- a deliberate content change, not a functionality regression.
  await expect(page.getByRole('heading', { name: /Turning flexible demand/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open Simulation' }).first()).toBeVisible()
})

test('2. Dashboard loads', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Simulation Dashboard' })).toBeVisible()
})

test('3. Dashboard receives API data', async ({ page }) => {
  await page.goto('/dashboard')
  // "Modeled peak demand" KPI must resolve to a real, non-placeholder value (not the loading
  // spinner, not an em-dash placeholder).
  const card = page.locator('text=Modeled peak demand').locator('..')
  await expect(card.getByText(/kW|W/)).toBeVisible({ timeout: 10000 })
})

test('4. KPI cards display', async ({ page }) => {
  await page.goto('/dashboard')
  // Some labels (e.g. "Delivered flexibility") appear in both the top KPI row and the
  // per-hour Flexibility panel -- .first() is correct here, both are real, valid occurrences.
  for (const label of ['Modeled peak demand', 'Controlled peak', 'Peak reduction', 'Shortfall hours', 'Delivered flexibility']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible({ timeout: 10000 })
  }
})

test('5. Timeline works', async ({ page }) => {
  await page.goto('/dashboard')
  const slider = page.locator('input[type="range"]')
  await expect(slider).toBeVisible({ timeout: 10000 })
  const before = await page.locator('text=/Net demand/').locator('..').textContent()
  await slider.fill('500')
  await page.waitForTimeout(200)
  const after = await page.locator('text=/Net demand/').locator('..').textContent()
  expect(before).not.toEqual(after)
})

test('6. Play/Pause works', async ({ page }) => {
  await page.goto('/dashboard')
  const playButton = page.getByRole('button', { name: 'Play' })
  await expect(playButton).toBeVisible({ timeout: 10000 })
  await playButton.click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
})

test('7. Scenario selector works', async ({ page }) => {
  await page.goto('/dashboard')
  const eligibilitySelect = page.locator('select').first()
  await eligibilitySelect.selectOption('baseline')
  // The badge text, not the <option>'s own label (which also contains "Evidence-Backed").
  await expect(page.getByText('EVIDENCE-BACKED', { exact: true })).toBeVisible({ timeout: 10000 })
})

test('8. Counterfactual scenario loads', async ({ page }) => {
  await page.goto('/dashboard')
  const eligibilitySelect = page.locator('select').first()
  await eligibilitySelect.selectOption('counterfactual_broad')
  await expect(page.getByText('COUNTERFACTUAL · ILLUSTRATIVE')).toBeVisible({ timeout: 10000 })
})

test('9. Transformer page loads', async ({ page }) => {
  await page.goto('/transformers')
  await expect(page.getByRole('heading', { name: 'Transformers' })).toBeVisible()
  await expect(page.getByText('DT_SRH_001')).toBeVisible({ timeout: 10000 })
})

test('10. Household page loads', async ({ page }) => {
  await page.goto('/households')
  await expect(page.getByRole('heading', { name: 'Households' })).toBeVisible()
  await expect(page.locator('table')).toBeVisible({ timeout: 10000 })
})

test('11. Appliance page loads', async ({ page }) => {
  await page.goto('/appliances')
  // 4 of 13, not 4 of 16 -- see the Phase 11 regression fix in backend/app/api/topology.py
  // (get_appliances) and backend/tests/test_api.py::test_appliances_excludes_iawe_donor_household.
  await expect(page.getByText(/Only 4 of 13/)).toBeVisible({ timeout: 10000 })
})

test('12. Results page loads', async ({ page }) => {
  await page.goto('/results')
  await expect(page.getByRole('heading', { name: 'Validated Results' })).toBeVisible()
  await expect(page.getByText('1. Evidence-backed baseline')).toBeVisible({ timeout: 10000 })
})

test('13. Methodology page loads', async ({ page }) => {
  await page.goto('/methodology')
  await expect(page.getByRole('heading', { name: 'Methodology' })).toBeVisible()
  await expect(page.getByText('REAL', { exact: true })).toBeVisible()
})

test('14. Evidence page loads', async ({ page }) => {
  await page.goto('/evidence')
  await expect(page.getByRole('heading', { name: 'Evidence & Claims' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Not established' })).toBeVisible({ timeout: 10000 })
})

test('15. Limitations page loads', async ({ page }) => {
  await page.goto('/limitations')
  await expect(page.getByRole('heading', { name: 'Limitations' })).toBeVisible()
  await expect(page.getByText(/4 of 13/)).toBeVisible({ timeout: 10000 })
})

test('16. API failure state renders correctly (never a fabricated zero)', async ({ page }) => {
  await page.route('**/api/feeder/kpis*', (route) => route.abort('failed'))
  await page.goto('/dashboard')
  await expect(page.getByText(/Could not load/i)).toBeVisible({ timeout: 10000 })
})

test('Zero-flexibility baseline is explained, not shown as an error', async ({ page }) => {
  await page.goto('/dashboard')
  await page.locator('select').first().selectOption('baseline')
  await expect(page.getByText('0 W currently controllable under evidence-backed eligibility')).toBeVisible({ timeout: 10000 })
})
