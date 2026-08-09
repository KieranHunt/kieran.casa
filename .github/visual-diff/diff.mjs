import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const previewUrl = requireEnv("PREVIEW_URL");
const prodUrl = process.env.PROD_URL ?? "https://kieran.casa";
const outDir = process.env.OUT_DIR ?? "out";
const maxDiffRatio = 0.001;
const workers = 3;
const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];
const textFiles = ["/feed.xml", "/sitemap.xml", "/robots.txt"];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var ${name}`);
    process.exit(2);
  }
  return value;
}

function normalizeText(filePath, text) {
  const normalized = text
    .replaceAll(new URL(previewUrl).host, "HOST")
    .replaceAll(new URL(prodUrl).host, "HOST")
    .replace(/<updated>[^<]*<\/updated>/g, "<updated/>")
    .replace(/<lastmod>[^<]*<\/lastmod>/g, "<lastmod/>")
    .replace(/<generator[^>]*>[^<]*<\/generator>/g, "<generator/>");
  if (filePath === "/sitemap.xml") {
    return (normalized.match(/<url>.*?<\/url>/gs) ?? [normalized]).sort().join("\n");
  }
  return normalized;
}

async function fetchText(base, filePath) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(new URL(filePath, base));
      if (!response.ok) throw new Error(`${response.status} for ${filePath} on ${base}`);
      return await response.text();
    } catch (error) {
      if (attempt >= 4) throw error;
      console.log(`retrying ${filePath} on ${base} after: ${error.cause?.code ?? error.message}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
    }
  }
}

async function diffTextFiles() {
  const failures = [];
  for (const filePath of textFiles) {
    let preview;
    let prod;
    try {
      [preview, prod] = await Promise.all([
        fetchText(previewUrl, filePath),
        fetchText(prodUrl, filePath),
      ]);
    } catch (error) {
      failures.push({ page: filePath, viewport: "text", ratio: null, error: error.message.split("\n")[0] });
      continue;
    }
    if (normalizeText(filePath, preview) !== normalizeText(filePath, prod)) {
      const slug = slugify(filePath);
      await mkdir(path.join(outDir, slug), { recursive: true });
      await writeFile(path.join(outDir, slug, "preview.txt"), normalizeText(filePath, preview));
      await writeFile(path.join(outDir, slug, "prod.txt"), normalizeText(filePath, prod));
      failures.push({ page: filePath, viewport: "text", ratio: null });
    }
  }
  return failures;
}

async function sitemapPaths() {
  const sitemap = await fetchText(previewUrl, "/sitemap.xml");
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname
  );
  return [...new Set(paths)].sort();
}

function slugify(pagePath) {
  return pagePath === "/" ? "home" : pagePath.replaceAll(/[^a-z0-9.-]+/gi, "-").replaceAll(/^-|-$/g, "");
}

async function capture(context, base, pagePath) {
  const page = await context.newPage();
  try {
    await page.goto(new URL(pagePath, base).href, { waitUntil: "load", timeout: 45_000 });
    await page.evaluate(async () => {
      for (const img of document.querySelectorAll("img[loading=lazy]")) img.loading = "eager";
      await document.fonts.ready;
      await Promise.all(
        [...document.images]
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              })
          )
      );
    });
    await page.waitForTimeout(250);
    return await page.screenshot({ fullPage: true, animations: "disabled" });
  } finally {
    await page.close();
  }
}

function padTo(image, width, height) {
  if (image.width === width && image.height === height) return image;
  const padded = new PNG({ width, height });
  PNG.bitblt(image, padded, 0, 0, image.width, image.height, 0, 0);
  return padded;
}

function compareScreenshots(previewBuffer, prodBuffer) {
  const preview = PNG.sync.read(previewBuffer);
  const prod = PNG.sync.read(prodBuffer);
  const width = Math.max(preview.width, prod.width);
  const height = Math.max(preview.height, prod.height);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(
    padTo(preview, width, height).data,
    padTo(prod, width, height).data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );
  return { ratio: mismatched / (width * height), diff };
}

async function diffPage(contexts, pagePath, viewport) {
  const attempt = async () => {
    const [previewShot, prodShot] = await Promise.all([
      capture(contexts.preview[viewport.name], previewUrl, pagePath),
      capture(contexts.prod[viewport.name], prodUrl, pagePath),
    ]);
    return { previewShot, prodShot, ...compareScreenshots(previewShot, prodShot) };
  };

  let result;
  try {
    result = await attempt();
    if (result.ratio > maxDiffRatio) result = await attempt();
  } catch {
    try {
      result = await attempt();
    } catch (error) {
      const reason = error.message.split("\n")[0];
      console.log(`error ${pagePath} [${viewport.name}]: ${reason}`);
      return { page: pagePath, viewport: viewport.name, ratio: null, error: reason };
    }
  }

  if (result.ratio > maxDiffRatio) {
    const slug = `${slugify(pagePath)}-${viewport.name}`;
    await mkdir(path.join(outDir, slug), { recursive: true });
    await writeFile(path.join(outDir, slug, "preview.png"), result.previewShot);
    await writeFile(path.join(outDir, slug, "prod.png"), result.prodShot);
    await writeFile(path.join(outDir, slug, "diff.png"), PNG.sync.write(result.diff));
    return { page: pagePath, viewport: viewport.name, ratio: result.ratio };
  }
  console.log(`ok ${pagePath} [${viewport.name}] ${(result.ratio * 100).toFixed(4)}%`);
  return null;
}

async function runPool(tasks, limit) {
  const queue = [...tasks];
  const results = [];
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (queue.length > 0) {
        results.push(await queue.shift()());
      }
    })
  );
  return results;
}

await mkdir(outDir, { recursive: true });
const failures = await diffTextFiles();

const paths = await sitemapPaths();
console.log(`Comparing ${paths.length} pages x ${viewports.length} viewports`);
console.log(`preview: ${previewUrl}`);
console.log(`prod:    ${prodUrl}`);

const browser = await chromium.launch();
const newContext = async (viewport) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    let seed = 42;
    Math.random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed / 2_147_483_648;
    };
  });
  return context;
};
const contexts = { preview: {}, prod: {} };
for (const viewport of viewports) {
  contexts.preview[viewport.name] = await newContext(viewport);
  contexts.prod[viewport.name] = await newContext(viewport);
}

const tasks = paths.flatMap((pagePath) =>
  viewports.map((viewport) => () => diffPage(contexts, pagePath, viewport))
);
failures.push(...(await runPool(tasks, workers)).filter(Boolean));
await browser.close();

failures.sort((a, b) => (b.ratio ?? 1) - (a.ratio ?? 1));
await writeFile(
  path.join(outDir, "summary.json"),
  JSON.stringify({ previewUrl, prodUrl, pages: paths.length, failures }, null, 2)
);

if (failures.length > 0) {
  const rows = failures.map(
    (failure) =>
      `| \`${failure.page}\` | ${failure.viewport} | ${
        failure.error ?? (failure.ratio === null ? "content mismatch" : `${(failure.ratio * 100).toFixed(2)}% of pixels`)
      } |`
  );
  const report = [
    `Visual diff found differences between the deploy preview and production on ${failures.length} of ${paths.length * viewports.length} checks:`,
    "",
    "| Page | Viewport | Difference |",
    "| --- | --- | --- |",
    ...rows,
  ].join("\n");
  await writeFile(path.join(outDir, "failures.md"), report);
  console.error(`\n${report}`);
  process.exit(1);
}

console.log(`\nAll ${paths.length * viewports.length} checks passed.`);
