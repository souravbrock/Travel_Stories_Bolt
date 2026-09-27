import { chromium } from "playwright-core";
import { execSync } from "node:child_process";

const BASE = process.argv[2] ?? "http://localhost:8080";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e).split("\n")[0]));
await p.goto(BASE, { waitUntil: "networkidle" });
await p.waitForSelector("header nav button", { timeout: 15000 });
await p.waitForTimeout(800);

const clickText = async (sel, text) => {
  await p.evaluate(
    ([sel, text]) => {
      const btn = [...document.querySelectorAll(sel)].find((x) => (x.textContent || "").includes(text));
      if (!btn) throw new Error("missing button: " + text);
      btn.click();
    },
    [sel, text],
  );
};

// ---- vendor signup ----
await clickText("header button", "Sign In");
await p.waitForTimeout(400);
await clickText("button", "Create Account");
await p.waitForTimeout(300);
await clickText("button", "Vendor / Service Provider");
await p.waitForTimeout(300);
await p.getByPlaceholder("Enter your full name").fill("Vendor Vicky");
await p.getByPlaceholder("you@example.com").fill("vicky@test.com");
await p.getByPlaceholder("+91 98765 43210").fill("+91 9111111111");
await clickText("button", "Continue");
await p.waitForTimeout(300);
await clickText("button", "Send Verification Code");
await p.waitForFunction(() => /Your code is \d{5}/.test(document.body.textContent || ""), null, { timeout: 30000 });
const code = await p.evaluate(() => document.body.textContent.match(/Your code is (\d{5})/)[1]);
await p.locator('input[maxlength="5"]').fill(code);
await p.getByPlaceholder("Minimum 6 characters").fill("secret123");
await p.getByPlaceholder("Re-enter password").fill("secret123");
await clickText("button", "Verify & Create Account");
await p.waitForTimeout(1200);
const dashTab = await p.evaluate(() => [...document.querySelectorAll("header nav button")].some((x) => /My Dashboard/.test(x.textContent || "")));
console.log("vendor dashboard tab:", dashTab);

// ---- vendor creates a package ----
await clickText("header nav button", "My Dashboard");
await p.waitForTimeout(800);
await clickText("button", "Add New Package");
await p.waitForTimeout(400);
await p.getByPlaceholder("Kerala Backwaters Tour").fill("Vicky Goa Special");
await p.getByPlaceholder("Kerala", { exact: true }).fill("Goa");
await clickText("button", "Create Package");
await p.waitForTimeout(1200);
const listed = await p.evaluate(() => document.body.textContent.includes("Vicky Goa Special"));
console.log("vendor package listed:", listed);
const pending = await p.evaluate(() => document.body.textContent.includes("Pending Approval") || document.body.textContent.includes("Pending"));
console.log("pending-approval notice:", pending);

// ---- promote to admin via DB, reload ----
execSync(`python3 -c "import sqlite3; c=sqlite3.connect('preview/trvlstory.db'); c.execute(\\"UPDATE users SET role='admin' WHERE email='vicky@test.com'\\"); c.commit()"`, { cwd: process.cwd() });
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const adminTab = await p.evaluate(() => [...document.querySelectorAll("header nav button")].some((x) => /Admin Console/.test(x.textContent || "")));
console.log("admin console tab after promote:", adminTab);
await clickText("header nav button", "Admin Console");
await p.waitForTimeout(1000);
const seesVendor = await p.evaluate(() => document.body.textContent.includes("Vendor Vicky") || document.body.textContent.includes("Vicky"));
console.log("admin sees vendor:", seesVendor);
await clickText("main button", "Packages");
await p.waitForTimeout(600);
await clickText("main button", "Approve");
await p.waitForTimeout(1000);
const approved = await p.evaluate(() => !document.body.textContent.includes("Vicky Goa Special") || document.body.textContent.includes("Approved"));
console.log("package approved (no pending approve btn):", approved);

// ---- public marketplace shows it ----
await clickText("header nav button", "Tour Packages");
await p.waitForTimeout(1500);
const pub = await p.evaluate(() => document.body.textContent.includes("Vicky Goa Special"));
console.log("public marketplace shows vendor pkg:", pub);
await p.screenshot({ path: "roles-ui.png" });
console.log("ERRORS", JSON.stringify(errs));
await b.close();
if (!dashTab || !listed || !adminTab || !pub || errs.length) process.exit(1);
console.log("ROLES UI PASS");
