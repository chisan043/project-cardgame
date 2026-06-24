import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import {
  EVENT_UI_SCENARIOS,
  EVENT_UI_VIEWPORTS,
  getEventUiSnapshotPath
} from './event-ui-snapshot-scenarios.mjs';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8765/questers_demo_v0.99.html';
const DEFAULT_CHROME_PATH = '/Users/chi/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    out: `test_reports/event-ui-concept/${new Date().toISOString().replace(/[:.]/g, '-')}`,
    executablePath: process.env.PLAYWRIGHT_CHROME_PATH || DEFAULT_CHROME_PATH
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') args.baseUrl = argv[++index];
    else if (arg === '--out') args.out = argv[++index];
    else if (arg === '--executable-path') args.executablePath = argv[++index];
    else if (arg === '--help') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

async function waitForVisuals(page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
    const pendingImages = Array.from(document.images || []).filter(image => !image.complete);
    await Promise.all(pendingImages.map(image => new Promise(resolveImage => {
      image.onload = resolveImage;
      image.onerror = resolveImage;
    })));
  });
  await page.waitForTimeout(350);
}

async function prepareRun(page) {
  await page.goto(page.__questersBaseUrl, { waitUntil: 'domcontentloaded' });
  await waitForVisuals(page);
  await page.getByRole('button', { name: '踏 上 旅 途' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: '选 择 此 身' }).first().click();
  await waitForVisuals(page);
  await page.evaluate(() => {
    localStorage.removeItem('questers-shop-layout-editor-v5');
    state.gold = 236;
    if (!state.deck?.length) state.deck = initialDeck.map(card => ({ ...card }));
  });
}

async function captureScenario(page, scenario) {
  await page.evaluate(expression => {
    for (const id of ['overlay-shop', 'overlay-event', 'overlay-rest']) {
      const overlay = document.getElementById(id);
      if (overlay) overlay.style.display = 'none';
    }
    // eslint-disable-next-line no-new-func
    Function(expression)();
  }, scenario.openExpression);
  await waitForVisuals(page);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node tools/capture_event_ui_states.mjs [--base-url URL] [--out DIR] [--executable-path PATH]');
    return;
  }
  if (!existsSync(args.executablePath)) {
    throw new Error(`Chrome executable not found: ${args.executablePath}`);
  }

  const { chromium } = require('playwright');
  const browser = await chromium.launch({
    headless: true,
    executablePath: args.executablePath
  });
  const manifest = {
    baseUrl: args.baseUrl,
    outputDir: args.out,
    generatedAt: new Date().toISOString(),
    viewports: EVENT_UI_VIEWPORTS,
    scenarios: EVENT_UI_SCENARIOS.map(({ id, family }) => ({ id, family })),
    captures: []
  };

  try {
    for (const viewport of EVENT_UI_VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1
      });
      page.__questersBaseUrl = args.baseUrl;
      await prepareRun(page);
      for (const scenario of EVENT_UI_SCENARIOS) {
        await captureScenario(page, scenario);
        const screenshotPath = resolve(getEventUiSnapshotPath(args.out, viewport.name, scenario.id));
        await mkdir(dirname(screenshotPath), { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: false });
        manifest.captures.push({
          viewport: viewport.name,
          scenario: scenario.id,
          family: scenario.family,
          path: screenshotPath
        });
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const manifestPath = resolve(args.out, 'manifest.json');
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Captured ${manifest.captures.length} event UI screenshots`);
  console.log(manifestPath);
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
