# FlipProfit

FlipProfit is a **local-first, transparent deal-screening workbench** for independent vehicle and equipment resellers. It is designed to answer one question before a purchase: *does this deal clear my required profit after all known costs?*

## What it does

The worksheet starts blank. It does not contain sample deals, made-up pricing, fake users, reviews, or performance claims. Enter the expected sale price, buy price, acquisition and preparation costs, sale fees, and target profit. The interface immediately shows net profit, cash invested, ROI, break-even price, and the sale price required to reach the target.

The built-in Deal Agent is a **fully inspectable rules-based reviewer**. It blocks an incomplete price check, identifies every blank cost, refuses to label incomplete math as a buy/pass decision, and displays the exact evidence and formula behind every status. It does not fetch a market value, predict a sale, scrape a website, or fabricate a recommendation.

Saved work orders remain in browser local storage and can be exported as a CSV ledger. This version deliberately has no account, cloud database, payment flow, tracking script, or third-party data connection.

## Fee assumptions

The app includes editable custom fees, a general U.S. eBay starting assumption, and a local-cash option. Every fee source note stays visible in the worksheet. Platform rules vary by category and change over time: users must verify the current rules that apply to their actual sale.

## Run locally

```bash
pnpm install
pnpm dev
```

The app opens at the local Vite address printed in the terminal.

## Verify

```bash
pnpm exec vitest run
pnpm check
pnpm build
node scripts/verify-ui.mjs
```

The test suite verifies the calculation contract, transparent agent outcomes, CSV escaping, production build, and a real browser flow for saving, reloading, and exporting a temporary test work order.

## Calculation contract

```
acquisition cost = buy price + auction fee + transport + repair labor + parts + title/document + detail + other
selling fee      = expected sale price × fee rate + fixed selling fee
selling costs    = selling fee + advertising/listing
net profit       = expected sale price − acquisition cost − selling costs
```

The target and break-even sale prices correctly account for percentage-based sale fees.

## Data ownership

Your saved work orders are stored in the current browser under `flipprofit.savedDeals.v1`. Clearing browser site data will remove them. Export the CSV ledger if you need a portable copy.

## Source

The general eBay preset is based on eBay’s [Selling fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822) page, verified in the app copy on August 18, 2026. It is not a substitute for reviewing the exact current fee category and order conditions for a real listing.
