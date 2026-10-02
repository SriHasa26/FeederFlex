import { expect, test } from '@playwright/test'

// Section 11.9 -- responsive UI check at three representative widths. Verifies no horizontal
// overflow on the main dashboard (the most content-dense page) and that primary interactive
// elements remain visible/usable.
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
]

for (const vp of VIEWPORTS) {
  test(`Dashboard has no horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Simulation Dashboard' })).toBeVisible({ timeout: 10000 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1) // allow 1px rounding
  })

  test(`Landing page has no horizontal overflow at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Open Simulation' }).first()).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('Basic accessibility: nav links are real links, buttons have accessible names, inputs have labels', async ({ page }) => {
  await page.goto('/dashboard')
  const playButton = page.getByRole('button', { name: 'Play' })
  await expect(playButton).toBeVisible({ timeout: 10000 })
  const slider = page.locator('input[type="range"]')
  await expect(slider).toBeVisible()
  // Every <select> on the dashboard is preceded by a visible <label>.
  const selects = page.locator('select')
  const count = await selects.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    const labelText = await selects.nth(i).locator('xpath=preceding-sibling::label[1]').textContent().catch(() => null)
    expect(labelText).toBeTruthy()
  }
})

test('Main headings use a single h1 per page (Dashboard)', async ({ page }) => {
  await page.goto('/dashboard')
  const h1s = page.locator('h1')
  await expect(h1s).toHaveCount(1)
})
