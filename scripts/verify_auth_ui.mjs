import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:8080";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e).split("\n")[0]));
await p.goto(BASE, { waitUntil: "networkidle" });
await p.waitForSelector("header nav button", { timeout: 15000 });
await p.waitForTimeout(1000);

const hero = await p.evaluate(() => document.body.textContent.includes("Explore Incredible India"));
console.log("public home (no gate):", hero);

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

await clickText("header button", "Sign In");
await p.waitForTimeout(500);
await clickText("button", "Create Account");
await p.waitForTimeout(400);
await clickText("button", "Customer / Traveler");
await p.waitForTimeout(400);
await p.getByPlaceholder("Enter your full name").fill("UI Tester");
await p.getByPlaceholder("you@example.com").fill("uitest@example.com");
await p.getByPlaceholder("+91 98765 43210").fill("+91 9000000001");
await clickText("button", "Continue");
await p.waitForTimeout(400);
await clickText("button", "Send Verification Code");
await p.waitForFunction(
  () => /Your code is \d{5}/.test(document.body.textContent || ""),
  null,
  { timeout: 30000 },
);
const devCode = await p.evaluate(() => {
  const m = document.body.textContent.match(/Your code is (\d{5})/);
  return m ? m[1] : null;
});
console.log("dev code shown:", devCode);
await p.locator('input[maxlength="5"]').fill(devCode);
await p.getByPlaceholder("Minimum 6 characters").fill("secret123");
await p.getByPlaceholder("Re-enter password").fill("secret123");
await clickText("button", "Verify & Create Account");
await p.waitForTimeout(1500);
const badge = await p.evaluate(() => document.querySelector("header").textContent.includes("UI Tester"));
console.log("signed in, header shows name:", badge);
// customer has no dashboard tab
const dash = await p.evaluate(() => [...document.querySelectorAll("header nav button")].some((x) => /Dashboard|Console/.test(x.textContent || "")));
console.log("customer dashboard tab (expect false):", dash);
await p.screenshot({ path: "auth-ui.png" });
console.log("ERRORS", JSON.stringify(errs));
await b.close();
if (!hero || !devCode || !badge || dash || errs.length) process.exit(1);
console.log("AUTH UI PASS");
