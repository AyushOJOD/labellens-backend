import { describe, expect, it } from "vitest";
import { normalizeNutrition } from "./analysis.normalizer";
import type { ProductAnalysisInput } from "./analysis.types";

describe("normalizeNutrition", () => {
  it("normalizes new fat fields from per-serving values", () => {
    const product: ProductAnalysisInput = {
      productName: "Test Cooking Oil",
      category: "mustard_oil",
      productForm: "liquid",
      nutritionBasis: "per_serving",
      servingSize: 20,
      nutrition: {
        caloriesKcal: 180,
        totalFatG: 20,
        saturatedFatG: 4,
        transFatG: 0.2,
        monounsaturatedFatG: 8,
        polyunsaturatedFatG: 6,
        carbohydratesG: 0,
        sugarsG: 0,
        addedSugarsG: null,
        proteinG: 0,
        fiberG: 0,
        sodiumMg: 0,
      },
    };

    const result = normalizeNutrition(product);

    expect(result).not.toBeNull();
    expect(result?.basis).toBe("per_100ml");
    expect(result?.transFatG).toBe(1);
    expect(result?.monounsaturatedFatG).toBe(40);
    expect(result?.polyunsaturatedFatG).toBe(30);
  });

  it("preserves unknown fat subtype values as null", () => {
    const product: ProductAnalysisInput = {
      productName: "Test Cooking Oil",
      category: "olive_oil",
      productForm: "liquid",
      nutritionBasis: "per_100ml",
      servingSize: 100,
      nutrition: {
        caloriesKcal: 900,
        totalFatG: 100,
        saturatedFatG: 15,
        transFatG: null,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 0,
        sugarsG: 0,
        addedSugarsG: null,
        proteinG: 0,
        fiberG: 0,
        sodiumMg: 0,
      },
    };

    const result = normalizeNutrition(product);

    expect(result?.transFatG).toBeNull();
    expect(result?.monounsaturatedFatG).toBeNull();
    expect(result?.polyunsaturatedFatG).toBeNull();
  });

  it("preserves per-100-g values for a liquid product when labeled that way", () => {
    const product: ProductAnalysisInput = {
      productName: "Test Cooking Oil",
      category: "sunflower_oil",
      productForm: "liquid",
      nutritionBasis: "per_100g",
      servingSize: 100,
      nutrition: {
        caloriesKcal: 900,
        totalFatG: 100,
        saturatedFatG: 10,
        transFatG: null,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 0,
        sugarsG: 0,
        addedSugarsG: null,
        proteinG: 0,
        fiberG: 0,
        sodiumMg: 0,
      },
    };

    const result = normalizeNutrition(product);

    expect(result).not.toBeNull();
    expect(result?.basis).toBe("per_100g");
    expect(result?.totalFatG).toBe(100);
  });
});
