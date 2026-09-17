import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { siteRoutes } from '../src/routes'

const routePaths = new Set(siteRoutes.map(({ path }) => path))

function observeRuntimeFailures(page: Page) {
  const failures: string[] = []

  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console.error: ${message.text()}`)
  })
  page.on('requestfailed', (request) => {
    failures.push(`requestfailed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
  })
  page.on('response', (response) => {
    if (response.request().resourceType() === 'image' && response.status() >= 400) {
      failures.push(`image response: ${response.status()} ${response.url()}`)
    }
  })

  return failures
}

async function settlePage(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.locator('body').evaluate(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
}

async function expectNoHorizontalOverflow(page: Page, testInfo: TestInfo) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }))

  expect(
    dimensions.document,
    `${testInfo.project.name}: document width ${dimensions.document}px exceeds viewport ${dimensions.viewport}px`,
  ).toBeLessThanOrEqual(dimensions.viewport + 1)
  expect(
    dimensions.body,
    `${testInfo.project.name}: body width ${dimensions.body}px exceeds viewport ${dimensions.viewport}px`,
  ).toBeLessThanOrEqual(dimensions.viewport + 1)
}

test.describe('routes publiques', () => {
  for (const route of siteRoutes) {
    test(`${route.path} est rendue directement et reste dans le viewport`, async ({ page }, testInfo) => {
      const failures = observeRuntimeFailures(page)
      const response = await page.goto(route.path)
      await settlePage(page)

      expect(response?.ok(), `HTTP ${response?.status()} pour ${route.path}`).toBeTruthy()
      expect(new URL(page.url()).pathname).toBe(route.path)
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page).toHaveTitle(/SiL/)
      if (route.path !== '/') await expect(page.locator('main')).toContainText(route.label, { ignoreCase: true })

      const mainText = (await page.locator('main').innerText()).replace(/\s+/g, ' ').trim()
      expect(mainText.length, `${route.path} ne doit pas être un shell vide`).toBeGreaterThan(180)
      expect(mainText).not.toMatch(/\b(lorem ipsum|contenu à venir|placeholder)\b/i)
      await expect(page.locator('body')).not.toContainText(/\b404\b|page introuvable/i)

      await expectNoHorizontalOverflow(page, testInfo)
      expect(failures, failures.join('\n')).toEqual([])
    })
  }
})

test('tous les liens internes ciblent une route réelle et la navigation reste côté client', async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  test.skip(testInfo.project.name !== 'desktop', 'Une seule passe suffit pour la structure des liens')
  const failures = observeRuntimeFailures(page)
  const discovered = new Set<string>()
  const invalid: string[] = []

  for (const route of siteRoutes) {
    await page.goto(route.path)
    await settlePage(page)
    const hrefs = await page.locator('a[href]').evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).getAttribute('href') ?? ''),
    )

    for (const href of hrefs) {
      if (!href || href === '#') invalid.push(`${route.path}: lien sans destination (${JSON.stringify(href)})`)
      const target = new URL(href, page.url())
      if (target.origin !== new URL(page.url()).origin) continue
      discovered.add(target.pathname)
      if (!routePaths.has(target.pathname)) invalid.push(`${route.path}: ${href}`)
    }
  }

  expect(invalid, `Liens internes invalides:\n${invalid.join('\n')}`).toEqual([])
  expect(discovered.size, 'La navigation doit exposer la grande majorité des 19 pages').toBeGreaterThanOrEqual(17)

  await page.goto('/')
  await page.evaluate(() => ((window as typeof window & { __silE2EState?: string }).__silE2EState = 'alive'))
  const destination = page.locator('a[href="/energies-solutions"]').first()
  await expect(destination).toBeVisible()
  await destination.click()
  await expect(page).toHaveURL(/\/energies-solutions$/)
  expect(await page.evaluate(() => (window as typeof window & { __silE2EState?: string }).__silE2EState)).toBe('alive')
  expect(failures, failures.join('\n')).toEqual([])
})

test('les images présentes se chargent et possèdent un texte alternatif', async ({ page }, testInfo) => {
  test.setTimeout(60_000)
  test.skip(testInfo.project.name !== 'desktop', 'Une passe desktop charge toutes les sources utilisées')
  const failures = observeRuntimeFailures(page)
  let imageCount = 0

  for (const route of siteRoutes) {
    await page.goto(route.path)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await settlePage(page)
    const images = page.locator('img')
    const count = await images.count()
    imageCount += count

    for (let index = 0; index < count; index += 1) {
      const image = images.nth(index)
      expect(await image.getAttribute('alt'), `${route.path}: image ${index + 1} sans attribut alt`).not.toBeNull()
      const state = await image.evaluate((node: HTMLImageElement) => ({
        src: node.currentSrc || node.src,
        complete: node.complete,
        width: node.naturalWidth,
        height: node.naturalHeight,
      }))
      expect(state.complete, `${route.path}: chargement en attente pour ${state.src}`).toBeTruthy()
      expect(state.width, `${route.path}: image cassée ${state.src}`).toBeGreaterThan(0)
      expect(state.height, `${route.path}: image cassée ${state.src}`).toBeGreaterThan(0)
    }
  }

  expect(imageCount, 'Le POC éditorial doit contenir de vraies images').toBeGreaterThanOrEqual(3)
  expect(failures, failures.join('\n')).toEqual([])
})

test('le menu mobile s’ouvre, se ferme au clavier et permet de naviguer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Comportement propre au petit écran')
  const failures = observeRuntimeFailures(page)
  await page.goto('/')

  const menuButton = page.getByRole('button', { name: /menu|navigation/i })
  await expect(menuButton).toBeVisible()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await menuButton.click()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  expect(await page.locator('a[href^="/"]:visible').count()).toBeGreaterThanOrEqual(10)

  await page.keyboard.press('Escape')
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await expect(menuButton).toBeFocused()

  await menuButton.click()
  await page.locator('a[href="/electricite"]:visible').first().click()
  await expect(page).toHaveURL(/\/electricite$/)
  await expect(page.locator('main')).toContainText('Électricité')
  expect(failures, failures.join('\n')).toEqual([])
})

test('la recherche fonctionne lorsqu’elle est proposée', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Une passe desktop suffit pour la recherche')
  await page.goto('/')

  const searchInput = page.locator('#site-search').first()
  const searchTrigger = page.getByRole('button', { name: /recherch/i }).first()
  if (!(await searchInput.isVisible()) && (await searchTrigger.isVisible())) await searchTrigger.click()

  if (!(await searchInput.isVisible())) {
    test.info().annotations.push({ type: 'search', description: 'Aucune recherche proposée dans le POC' })
    return
  }

  await searchInput.fill('solaire')
  await expect(searchInput).toHaveValue('solaire')
  const matchingLink = page.getByRole('link', { name: /solaire/i }).first()
  await expect(matchingLink).toBeVisible()
  await matchingLink.click()
  await expect(page).toHaveURL(/\/solaire$/)
})

test('captures de réception', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'tablet', 'Les captures demandées sont desktop et mobile')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await settlePage(page)
  await page.screenshot({
    path: `research/screenshots/accueil-${testInfo.project.name}.png`,
    fullPage: true,
  })

  if (testInfo.project.name === 'desktop') {
    await page.goto('/electricite')
    await settlePage(page)
    await page.screenshot({ path: 'research/screenshots/electricite-desktop.png', fullPage: true })
  }
})
