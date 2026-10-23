import { describe, it, expect } from "vitest";
import { getCachedProductByBarcode, cacheProduct, getCacheStats } from "./products.cache";
import type { ProductAnalysisInput } from "../analysis/analysis.types";

describe("products.cache", () => {
  it("retrieves pre-seeded Indian supermarket staples", () => {
    // Parle-G barcode
    const product = getCachedProductByBarcode("8901719101018");
    expect(product).not.toBeNull();
    expect(product?.productName).toContain("Parle-G");
    expect(product?.category).toBe("biscuits");
  });

  it("retrieves Maggi noodles instantly", () => {
    const maggi = getCachedProductByBarcode("8901058863618");
    expect(maggi).not.toBeNull();
    expect(maggi?.productName).toContain("Maggi");
    expect(maggi?.nutrition.sodiumMg).toBeGreaterThan(800);
  });

  it("caches new products dynamically and updates total count", () => {
    const testBarcode = "8909999999999";
    const testInput: ProductAnalysisInput = {
      productName: "Test Indian Protein Bar",
      category: "snack",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 50,
      nutrition: {
        caloriesKcal: 380,
        totalFatG: 8,
        saturatedFatG: 2,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 45,
        sugarsG: 5,
        addedSugarsG: 0,
        proteinG: 25,
        fiberG: 8,
        sodiumMg: 120,
      },
    };

    cacheProduct(testBarcode, testInput, "user_scan");
    const retrieved = getCachedProductByBarcode(testBarcode);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.productName).toBe("Test Indian Protein Bar");
    expect(retrieved?.nutrition.proteinG).toBe(25);
  });
});
