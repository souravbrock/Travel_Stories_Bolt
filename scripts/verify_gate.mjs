import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:8080";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e).split("\n")[0]));
await p.goto(BASE, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);

// 1. logged out -> auth gate (no map, no marketplace)
const gated = await p.evaluate(() => ({
  auth: document.body.textContent.includes("Create Account"),
  map: document.body.textContent.includes("Explore Incredible India"),
}));
console.log("gated:", JSON.stringify(gated));

const click = (sel, t) =>
  p.evaluate(
    ([s, x]) => {
      const el = [...document.querySelectorAll(s)].find((e) => (e.textContent || "").trim() === x || (e.textContent || "").includes(x));
      if (!el) throw new Error("missing:" + x);
      el.click();
    },
    [sel, t],
  );

// 2. register as customer
await click("button", "Create Account");
await p.waitForTimeout(300);
await click("button", "Customer / Traveler");
await p.waitForTimeout(300);
await p.getByPlaceholder("Enter your full name").fill("Gate Test");
await p.getByPlaceholder("you@example.com").fill(`gate${Date.now()}@test.com`);
await p.getByPlaceholder("+91 98765 43210").fill("+91 9000000009");
await click("button", "Continue");
await p.waitForTimeout(300);
await click("button", "Send Verification Code");
await p.waitForFunction(() => /Your code is \d{5}/.test(document.body.textContent || ""), null, { timeout: 30000 });
const code = await p.evaluate(() => document.body.textContent.match(/Your code is (\d{5})/)[1]);
await p.locator('input[maxlength="5"]').fill(code);
await p.getByPlaceholder("Minimum 6 characters").fill("secret123");
await p.getByPlaceholder("Re-enter password").fill("secret123");
await click("button", "Verify & Create Account");
await p.waitForTimeout(1500);

// 3. inside the app now
const inside = await p.evaluate(() => ({
  map: document.body.textContent.includes("Explore Incredible India"),
  name: document.querySelector("header").textContent.includes("Gate Test"),
  noAuth: !document.body.textContent.includes("Create Account"),
}));
console.log("inside:", JSON.stringify(inside));

// 4. reload keeps session, still inside
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const kept = await p.evaluate(() => ({
  map: document.body.textContent.includes("Explore Incredible India"),
  name: document.querySelector("header").textContent.includes("Gate Test"),
}));
console.log("session kept:", JSON.stringify(kept));

// 5. sign out -> gate again
await p.evaluate(() => [...document.querySelectorAll("header button")].find((x) => x.title === "Sign out").click());
await p.waitForTimeout(800);
const out = await p.evaluate(() => document.body.textContent.includes("Create Account"));
console.log("gated after signout:", out);

console.log("ERRORS", JSON.stringify(errs));
await b.close();
const ok = gated.auth && !gated.map && inside.map && inside.name && inside.noAuth && kept.map && kept.name && out && !errs.length;
console.log(ok ? "GATE PASS" : "GATE FAIL");
process.exit(ok ? 0 : 1);
