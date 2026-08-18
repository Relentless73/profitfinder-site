# FlipProfit v1 Product Specification

## Primary job

Before buying a vehicle or piece of equipment, a reseller needs one reliable answer: **does this deal still clear my target profit after every known cost?**

## Transparency contract

FlipProfit does not seed sample deals, prices, users, reviews, success claims, or marketplace data. A blank worksheet is intentionally blank until the user enters facts. Every computed result exposes the exact user-entered values and formula components behind it. Any agent guidance must state which entered facts support the recommendation, which cost categories are blank or unverified, and that it does not know external market facts unless the user has entered them.

## Input model

| Field | Key | Notes |
| --- | --- | --- |
| Work order name | `dealName` | Optional while calculating; generated when saving if blank. |
| Expected sale price | `expectedSalePrice` | Required, non-negative dollar amount. |
| Buy price | `buyPrice` | Required, non-negative dollar amount. |
| Auction / purchase fee | `auctionFee` | Non-negative dollar amount. |
| Transport / tow | `transportCost` | Non-negative dollar amount. |
| Repair labor | `repairLabor` | Non-negative dollar amount. |
| Parts | `partsCost` | Non-negative dollar amount. |
| Title / document costs | `titleDocCost` | Non-negative dollar amount. |
| Detail / cleanup | `detailCost` | Non-negative dollar amount. |
| Other costs | `otherCost` | Non-negative dollar amount for insurance, storage, etc. |
| Marketplace fee preset | `marketplace` | `custom`, `ebay-general`, or `local-sale`. |
| Selling fee percent | `feeRate` | Editable percentage. |
| Fixed selling fee | `feeFlat` | Editable dollar amount. |
| Advertising / listing cost | `adCost` | Non-negative dollar amount. |
| Target profit | `targetProfit` | Non-negative dollar amount. |
| Deal notes | `notes` | Optional plain text saved only on this device. |

## Calculation contract

All money values are rounded only for display and remain finite numbers in the underlying calculation.

```
acquisitionCost = buyPrice + auctionFee + transportCost + repairLabor + partsCost + titleDocCost + detailCost + otherCost
sellingFee      = expectedSalePrice × (feeRate / 100) + feeFlat
sellingCosts    = sellingFee + adCost
netProfit       = expectedSalePrice − acquisitionCost − sellingCosts
cashInvested    = acquisitionCost
roiPercent      = cashInvested > 0 ? (netProfit / cashInvested) × 100 : 0
marginPercent   = expectedSalePrice > 0 ? (netProfit / expectedSalePrice) × 100 : 0
denominator     = max(0.0001, 1 − (feeRate / 100))
breakEvenPrice  = (acquisitionCost + feeFlat + adCost) / denominator
targetPrice     = (acquisitionCost + feeFlat + adCost + targetProfit) / denominator
```

The deal status is **BUY** when `netProfit >= targetProfit`, **BORDERLINE** when `netProfit >= 0` but below target, and **PASS** when `netProfit < 0`.

## Transparent deal agent

The first agent is deliberately rule-based rather than a black-box chat response. It is an accountable review workflow: it checks whether a decision can be trusted, identifies the exact missing fields, and presents only recommendations supported by the worksheet.

| Agent check | Trigger | Agent output | Evidence shown |
| --- | --- | --- | --- |
| Required price check | Expected sale price or buy price is blank | `BLOCKED — enter both prices before a deal decision is possible.` | The missing field names. |
| Cost coverage check | Any cost field is blank, rather than explicitly entered as `$0` | `NEEDS REVIEW — confirm these costs before relying on the result.` | Every blank cost label. |
| Selling-cost check | Fee rate, fixed fee, or advertising cost is blank | `NEEDS REVIEW — confirm selling costs.` | The specific blank selling-cost label. |
| Target check | Target profit is blank | `TARGET MISSING — set the minimum profit you require.` | The target field. |
| Result check | Required prices exist and all fields are explicitly confirmed | `BUY`, `BORDERLINE`, or `PASS` based exclusively on the calculation contract. | Net profit, target profit, and the arithmetic components. |

The agent never calls an external service, invents a comparable sale price, implies a probability of sale, or claims the deal is good in the real market. It uses only current worksheet data. A visible **Why this result?** panel exposes the formula and all decision rules that were applied.

## Persistence and export

Saved work orders live in browser `localStorage` under `flipprofit.savedDeals.v1`. Saving an existing selected work order updates it; saving a new one adds it at the beginning of the list. A saved row includes the full input snapshot, calculated values, an ID, and an ISO timestamp.

CSV export converts every saved record to one fully escaped row. The export contains only deal facts and calculated results; it never includes browser-only UI state.

## Required interactions

| Interaction | Expected behavior |
| --- | --- |
| Change a number | Result values and decision stamp update immediately. |
| Select a marketplace preset | Fee percentage and flat fee populate, but remain editable. |
| Save work order | Persist locally, show a successful toast, and render it in the saved list. |
| Open saved work order | Restore its inputs, results, and notes into the worksheet. |
| Delete saved work order | Remove it after a native confirmation. |
| Export ledger | Download a valid CSV file containing saved work orders. |
| Reset worksheet | Restore clean default values after a native confirmation. |
| “How it works” | Scroll to the calculation and fee assumptions section. |

## Deliberate scope limits

This initial static version does not scrape sites, offer automated appraisal values, process a payment, submit email addresses, or sync across devices. It is a calculator and local ledger that works completely without an account.
