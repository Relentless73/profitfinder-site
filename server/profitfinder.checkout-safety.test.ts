import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("Profitfinder checkout safety", () => {
  it("uses only an available live Shopify variant for checkout", () => {
    expect(homeSource).toContain("const liveVariant = bundle?.variants.find")
    expect(homeSource).toContain("const activeBundle = bundle && liveVariant")
    expect(homeSource).toContain("variantId: liveVariant.id")
  });

  it("does not retain stale fallback checkout metadata or display a buy button when the live catalog is unavailable", () => {
    expect(homeSource).not.toContain("52202337632544")
    expect(homeSource).not.toContain("verifiedBundleFallback")
    expect(homeSource).toContain("Checkout is not shown yet.")
  });
});
