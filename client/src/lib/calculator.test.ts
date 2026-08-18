import { describe, expect, it } from "vitest";
import {
  blankDeal,
  buildLedgerCsv,
  calculateDeal,
  reviewDeal,
  type DealValues,
} from "./calculator";

const completedDeal: DealValues = {
  ...blankDeal,
  dealName: "Actual entered work order",
  expectedSalePrice: "10000",
  buyPrice: "5000",
  auctionFee: "300",
  transportCost: "200",
  repairLabor: "400",
  partsCost: "500",
  titleDocCost: "100",
  detailCost: "100",
  otherCost: "0",
  marketplace: "custom",
  feeRate: "10",
  feeFlat: "50",
  adCost: "50",
  targetProfit: "2000",
};

describe("FlipProfit calculations", () => {
  it("calculates acquisition cost, selling costs, net profit, and target price", () => {
    const result = calculateDeal(completedDeal);
    expect(result.acquisitionCost).toBe(6600);
    expect(result.sellingFee).toBe(1050);
    expect(result.sellingCosts).toBe(1100);
    expect(result.netProfit).toBe(2300);
    expect(result.roiPercent).toBeCloseTo(34.848, 2);
    expect(result.breakEvenPrice).toBeCloseTo(7444.44, 2);
    expect(result.targetPrice).toBeCloseTo(9666.67, 2);
  });

  it("blocks a deal review when a required price is not entered", () => {
    const values = { ...completedDeal, expectedSalePrice: "" };
    const review = reviewDeal(values, calculateDeal(values));
    expect(review.label).toBe("BLOCKED");
    expect(review.missing).toContain("Expected sale price");
  });

  it("requires review instead of creating a recommendation when costs are blank", () => {
    const values = { ...completedDeal, partsCost: "" };
    const review = reviewDeal(values, calculateDeal(values));
    expect(review.label).toBe("NEEDS REVIEW");
    expect(review.missing).toContain("Parts");
  });

  it("creates a BUY recommendation only from complete user-entered inputs", () => {
    const review = reviewDeal(completedDeal, calculateDeal(completedDeal));
    expect(review.label).toBe("BUY");
  });

  it("exports user-entered notes as a valid escaped CSV row", () => {
    const csv = buildLedgerCsv([
      {
        id: "only-real-entry",
        savedAt: "2026-08-18T12:00:00.000Z",
        values: { ...completedDeal, notes: 'Check "title", call seller' },
      },
    ]);
    expect(csv).toContain('"Check ""title"", call seller"');
    expect(csv.split("\n")).toHaveLength(2);
  });
});
