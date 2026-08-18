export type MarketplaceId = "custom" | "ebay-general" | "local-cash";

export type DealValues = {
  dealName: string;
  expectedSalePrice: string;
  buyPrice: string;
  auctionFee: string;
  transportCost: string;
  repairLabor: string;
  partsCost: string;
  titleDocCost: string;
  detailCost: string;
  otherCost: string;
  marketplace: MarketplaceId;
  feeRate: string;
  feeFlat: string;
  adCost: string;
  targetProfit: string;
  notes: string;
};

export type SavedDeal = {
  id: string;
  savedAt: string;
  values: DealValues;
};

export const blankDeal: DealValues = {
  dealName: "",
  expectedSalePrice: "",
  buyPrice: "",
  auctionFee: "",
  transportCost: "",
  repairLabor: "",
  partsCost: "",
  titleDocCost: "",
  detailCost: "",
  otherCost: "",
  marketplace: "custom",
  feeRate: "",
  feeFlat: "",
  adCost: "",
  targetProfit: "",
  notes: "",
};

export const marketplacePresets: Record<
  MarketplaceId,
  { label: string; rate: string; flat: string; source: string; sourceUrl?: string }
> = {
  custom: {
    label: "Custom / manual fees",
    rate: "",
    flat: "",
    source: "No platform rule selected. Enter your own fee assumptions.",
  },
  "ebay-general": {
    label: "eBay — general US category",
    rate: "13.6",
    flat: "0.40",
    source:
      "eBay states 13.6% on most categories up to $7,500 plus $0.40 per order over $10. Category and order-value exceptions apply. Verified August 18, 2026.",
    sourceUrl: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
  },
  "local-cash": {
    label: "Local cash sale — confirm manually",
    rate: "0",
    flat: "0",
    source:
      "No marketplace fee is assumed. Confirm tax, payment-processing, delivery, and labor costs yourself before relying on this result.",
  },
};

export const costFields: Array<{ key: keyof DealValues; label: string }> = [
  { key: "auctionFee", label: "Auction / purchase fee" },
  { key: "transportCost", label: "Transport / tow" },
  { key: "repairLabor", label: "Repair labor" },
  { key: "partsCost", label: "Parts" },
  { key: "titleDocCost", label: "Title / document costs" },
  { key: "detailCost", label: "Detail / cleanup" },
  { key: "otherCost", label: "Other costs" },
];

export const sellingFields: Array<{ key: keyof DealValues; label: string }> = [
  { key: "feeRate", label: "Selling fee rate" },
  { key: "feeFlat", label: "Fixed selling fee" },
  { key: "adCost", label: "Advertising / listing" },
];

const numberValue = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const isBlank = (value: string) => value.trim() === "";

export type DealCalculation = {
  priceReady: boolean;
  acquisitionCost: number;
  sellingFee: number;
  sellingCosts: number;
  netProfit: number;
  cashInvested: number;
  roiPercent: number;
  marginPercent: number;
  breakEvenPrice: number;
  targetPrice: number;
};

export function calculateDeal(values: DealValues): DealCalculation {
  const expectedSalePrice = numberValue(values.expectedSalePrice);
  const buyPrice = numberValue(values.buyPrice);
  const acquisitionCost =
    buyPrice +
    numberValue(values.auctionFee) +
    numberValue(values.transportCost) +
    numberValue(values.repairLabor) +
    numberValue(values.partsCost) +
    numberValue(values.titleDocCost) +
    numberValue(values.detailCost) +
    numberValue(values.otherCost);
  const feeRate = numberValue(values.feeRate) / 100;
  const fixedSellingFee = numberValue(values.feeFlat);
  const sellingFee = expectedSalePrice * feeRate + fixedSellingFee;
  const sellingCosts = sellingFee + numberValue(values.adCost);
  const netProfit = expectedSalePrice - acquisitionCost - sellingCosts;
  const cashInvested = acquisitionCost;
  const denominator = Math.max(0.0001, 1 - feeRate);
  const baseForSale = acquisitionCost + fixedSellingFee + numberValue(values.adCost);

  return {
    priceReady: !isBlank(values.expectedSalePrice) && !isBlank(values.buyPrice),
    acquisitionCost,
    sellingFee,
    sellingCosts,
    netProfit,
    cashInvested,
    roiPercent: cashInvested > 0 ? (netProfit / cashInvested) * 100 : 0,
    marginPercent: expectedSalePrice > 0 ? (netProfit / expectedSalePrice) * 100 : 0,
    breakEvenPrice: baseForSale / denominator,
    targetPrice: (baseForSale + numberValue(values.targetProfit)) / denominator,
  };
}

export type AgentReview = {
  label: "BLOCKED" | "NEEDS REVIEW" | "BUY" | "BORDERLINE" | "PASS";
  tone: "blocked" | "review" | "buy" | "borderline" | "pass";
  headline: string;
  summary: string;
  missing: string[];
  evidence: string[];
};

export function reviewDeal(values: DealValues, calculation: DealCalculation): AgentReview {
  const missingPrices = [
    ...(isBlank(values.expectedSalePrice) ? ["Expected sale price"] : []),
    ...(isBlank(values.buyPrice) ? ["Buy price"] : []),
  ];

  if (missingPrices.length > 0) {
    return {
      label: "BLOCKED",
      tone: "blocked",
      headline: "Enter both prices before screening this deal.",
      summary:
        "No decision is possible until the expected sale price and buy price are entered. FlipProfit is not using estimated or made-up prices.",
      missing: missingPrices,
      evidence: ["Required price fields are blank."],
    };
  }

  const missingCosts = [
    ...costFields.filter(({ key }) => isBlank(values[key])).map(({ label }) => label),
    ...sellingFields.filter(({ key }) => isBlank(values[key])).map(({ label }) => label),
    ...(isBlank(values.targetProfit) ? ["Target profit"] : []),
  ];

  if (missingCosts.length > 0) {
    return {
      label: "NEEDS REVIEW",
      tone: "review",
      headline: "The math is provisional until every cost is confirmed.",
      summary:
        "Blank fields are temporarily treated as $0 only to show the formula. They are not verified costs, and this is not a BUY or PASS recommendation.",
      missing: missingCosts,
      evidence: [
        `Current net profit, before blank-field confirmation: ${formatMoney(calculation.netProfit)}.`,
        "The active worksheet contains at least one unconfirmed cost or target.",
      ],
    };
  }

  const target = numberValue(values.targetProfit);
  if (calculation.netProfit >= target) {
    return {
      label: "BUY",
      tone: "buy",
      headline: "This work order clears your stated profit target.",
      summary:
        "This is a calculation result, not a market-value prediction. Confirm the expected sale price and all real-world conditions before buying.",
      missing: [],
      evidence: [
        `Net profit ${formatMoney(calculation.netProfit)} is at least your ${formatMoney(target)} target.`,
        `Calculated from ${formatMoney(calculation.acquisitionCost)} acquisition cost and ${formatMoney(calculation.sellingCosts)} selling costs.`,
      ],
    };
  }

  if (calculation.netProfit >= 0) {
    return {
      label: "BORDERLINE",
      tone: "borderline",
      headline: "The deal is positive, but it misses your stated target.",
      summary:
        "Lower the buy price, reduce verified costs, raise the sale price using real evidence, or walk away.",
      missing: [],
      evidence: [
        `Net profit ${formatMoney(calculation.netProfit)} is below your ${formatMoney(target)} target.`,
        `Minimum sale price for your target: ${formatMoney(calculation.targetPrice)}.`,
      ],
    };
  }

  return {
    label: "PASS",
    tone: "pass",
    headline: "This work order loses money using the inputs you entered.",
    summary:
      "Do not rely on a different outcome unless you can replace an input with a real, documented number.",
    missing: [],
    evidence: [
      `Calculated net loss: ${formatMoney(Math.abs(calculation.netProfit))}.`,
      `Break-even sale price: ${formatMoney(calculation.breakEvenPrice)}.`,
    ],
  };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number) {
  return `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;
}

export function csvEscape(value: string | number) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildLedgerCsv(deals: SavedDeal[]) {
  const headers = [
    "Saved at",
    "Work order",
    "Expected sale price",
    "Buy price",
    "Acquisition cost",
    "Selling costs",
    "Net profit",
    "ROI percent",
    "Break-even price",
    "Target price",
    "Agent status",
    "Notes",
  ];

  const rows = deals.map((deal) => {
    const calculation = calculateDeal(deal.values);
    const review = reviewDeal(deal.values, calculation);
    return [
      deal.savedAt,
      deal.values.dealName,
      deal.values.expectedSalePrice,
      deal.values.buyPrice,
      calculation.acquisitionCost,
      calculation.sellingCosts,
      calculation.netProfit,
      calculation.roiPercent.toFixed(2),
      calculation.breakEvenPrice,
      calculation.targetPrice,
      review.label,
      deal.values.notes,
    ]
      .map(csvEscape)
      .join(",");
  });

  return [headers.map(csvEscape).join(","), ...rows].join("\n");
}
