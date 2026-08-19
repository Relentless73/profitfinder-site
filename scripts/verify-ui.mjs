import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const failures = [];
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";

function assert(condition, message) {
  if (!condition) failures.push(message);
}

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "FlipProfit Deal Screening Bundle" }).waitFor({ timeout: 15_000 });
  assert(await page.getByText("USD · one-time", { exact: true }).count() > 0, "Live product price was not displayed.");
  const checkoutWindowPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Buy the bundle" }).click();
  const checkoutWindow = await checkoutWindowPromise;
  await checkoutWindow.waitForURL(/myshopify\.com\/(cart\/c\/|checkouts\/)/, { timeout: 20_000 });
  assert(checkoutWindow.url().includes("channel=online_store"), "Bundle checkout URL was not created for the storefront channel.");
  await checkoutWindow.close();

  await page.getByLabel("Work order name").fill("Browser verification work order");
  await page.getByLabel("Expected sale price").fill("10000");
  await page.getByLabel("Buy price").fill("5000");
  await page.getByLabel("Auction / purchase fee").fill("300");
  await page.getByLabel("Transport / tow").fill("200");
  await page.getByLabel("Repair labor").fill("400");
  await page.getByLabel("Parts").fill("500");
  await page.getByLabel("Title / document costs").fill("100");
  await page.getByLabel("Detail / cleanup").fill("100");
  await page.getByLabel("Other costs").fill("0");
  await page.getByLabel("Selling fee rate").fill("10");
  await page.getByLabel("Fixed selling fee").fill("50");
  await page.getByLabel("Advertising / listing").fill("50");
  await page.getByLabel("Your target profit").fill("2000");

  await page.waitForTimeout(150);
  assert((await page.locator(".decision-stamp strong").textContent())?.trim() === "BUY", "Complete entered values did not produce BUY status.");
  assert((await page.locator(".metric-emphasis strong").textContent())?.includes("$2,300"), "Net profit did not update to the expected calculated value.");

  await page.getByRole("button", { name: "Save work order" }).first().click();
  await page.waitForTimeout(100);
  assert(await page.getByText("Browser verification work order", { exact: true }).count() > 0, "Saved work order was not shown in the local ledger.");
  assert(await page.evaluate(() => window.localStorage.getItem("flipprofit.savedDeals.v1")?.includes("Browser verification work order") ?? false), "Saved work order was not persisted in local storage.");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export ledger CSV" }).click();
  const download = await downloadPromise;
  assert(download.suggestedFilename().endsWith(".csv"), "Ledger export did not produce a CSV file.");

  await page.reload({ waitUntil: "networkidle" });
  assert(await page.getByText("Browser verification work order", { exact: true }).count() > 0, "Saved work order did not persist after a page reload.");
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("UI verification passed: agent status, calculation, local save, reload persistence, and CSV export work.");
