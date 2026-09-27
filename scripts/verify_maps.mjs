// Headless verification for IndiaMap layout issues:
//  A) horizontal page overflow (preview card cut off at viewport edge)
//  B) Ladakh/northern geographies clipped above the SVG viewport
//  C) hover-card (Tamil Nadu) fully inside the viewport
// Usage: node scripts/verify_maps.mjs [baseUrl]
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:8080";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).split("\n")[0]));

await page.goto(BASE, { waitUntil: "networkidle" });
// Gate fast-lane: register via API, inject token, reload into the app
await page.evaluate(async () => {
  const email = "maps" + Date.now() + "@test.com";
  const c = await (
    await fetch("/api/auth/send-code.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
  ).json();
  const s = await (
    await fetch("/api/auth/signup.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        full_name: "Maps",
        phone: "",
        role: "customer",
        vendor_type: null,
        password: "secret123",
        code: c.dev_code,
      }),
    })
  ).json();
  localStorage.setItem("trvlstory_token", s.token);
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector("svg path", { timeout: 30000 });
await page.waitForTimeout(1500);

const metrics = await page.evaluate(() => {
  const svg = [...document.querySelectorAll("main svg")].sort(
    (a, b) => b.querySelectorAll("path").length - a.querySelectorAll("path").length,
  )[0];
  const svgRect = svg.getBoundingClientRect();
  let minTop = Infinity, maxBottom = -Infinity, minLeft = Infinity, maxRight = -Infinity;
  svg.querySelectorAll("path").forEach((p) => {
    const r = p.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    minTop = Math.min(minTop, r.top - svgRect.top);
    maxBottom = Math.max(maxBottom, r.bottom - svgRect.top);
    minLeft = Math.min(minLeft, r.left - svgRect.left);
    maxRight = Math.max(maxRight, r.right - svgRect.left);
  });
  return {
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    svgH: Math.round(svgRect.height),
    geoTop: Math.round(minTop),
    geoBottom: Math.round(maxBottom),
    geoLeft: Math.round(minLeft),
    geoRight: Math.round(maxRight),
  };
});
console.log("BASELINE", JSON.stringify(metrics));

// Hover a real state path (Rajasthan) to summon the preview card
const rj = await page.evaluate(() => {
  const svg = [...document.querySelectorAll("main svg")].sort(
    (a, b) => b.querySelectorAll("path").length - a.querySelectorAll("path").length,
  )[0];
  const t = [...svg.querySelectorAll("path")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, fill: el.getAttribute("fill") };
    })
    .filter((r) => r.fill === "#f9731630" && r.w > 12)
    .slice(0, 1)[0];
  return t ? { x: Math.round(t.x), y: Math.round(t.y) } : null;
});
if (!rj) {
  console.log("CARD {no Rajasthan path found}");
  process.exit(1);
}
await page.mouse.move(rj.x, rj.y);
await page.waitForTimeout(800);
const card = await page.evaluate(() => {
  const els = [...document.querySelectorAll("main button")];
  const btn = els.find((b) => /Explore /.test(b.textContent ?? ""));
  if (!btn) return { found: false };
  const card = btn.closest("div.rounded-2xl") ?? btn;
  const r = card.getBoundingClientRect();
  return {
    found: true, label: btn.textContent.trim(),
    left: Math.round(r.left), right: Math.round(r.right),
    innerW: window.innerWidth,
    overflowRight: Math.round(r.right - window.innerWidth),
  };
});
console.log("CARD", JSON.stringify(card));
await page.screenshot({ path: "map-check.png" });

// Mobile width check
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
const mob = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
}));
console.log("MOBILE", JSON.stringify(mob));
await page.screenshot({ path: "map-check-mobile.png" });

console.log("PAGEERRORS", JSON.stringify(errors));
await browser.close();
