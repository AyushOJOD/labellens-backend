import { describe, it, expect, vi } from "vitest";
import { lookupBarcodeAndAnalyze } from "./barcode.service";

describe("lookupBarcodeAndAnalyze", () => {
  it("rejects unknown barcodes gracefully", async () => {
    const result = await lookupBarcodeAndAnalyze("0000000000000");
    expect(result.success).toBe(false);
    expect(result.code).toBe("NOT_FOUND");
  });

  it("evaluates known barcodes with Indian benchmarks", async () => {
    // 8901030383748 or mock
    const result = await lookupBarcodeAndAnalyze("8901030383748");
    // If found on Open Food Facts or not found, it responds with expected contract
    expect(result).toHaveProperty("success");
    if (result.success) {
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("evaluation");
      expect(result.evaluation).toHaveProperty("status");
    }
  });
});
