import { describe, it, expect } from "vitest";
import { evaluateNutrition } from "./analysis.service";
import { normalizeNutrition } from "./analysis.normalizer";
import type { ProductAnalysisInput } from "./analysis.types";

const biscuit: ProductAnalysisInput = {
  productName: "Chocolate Biscuits",
  category: "biscuits",
  productForm: "solid",
  nutritionBasis: "per_serving",
  servingSize: 30,
  nutrition: {
    caloriesKcal: 150,
    totalFatG: 7,
    saturatedFatG: 3,
    transFatG: null,
    monounsaturatedFatG: null,
    polyunsaturatedFatG: null,
    carbohydratesG: 20,
    sugarsG: 8,
    addedSugarsG: 6,
    proteinG: 2,
    fiberG: 1,
    sodiumMg: 120,
  },
};

describe("normalizeNutrition", () => {
  it("converts per-serving values to per 100 g", () => {
    const result = normalizeNutrition(biscuit);

    expect(result?.basis).toBe("per_100g");
    expect(result?.sugarsG).toBe(26.67);
    expect(result?.caloriesKcal).toBe(500);
  });

  it("does not normalize per-100-g values twice", () => {
    const product: ProductAnalysisInput = {
      ...biscuit,
      nutritionBasis: "per_100g",
      servingSize: null,
      nutrition: {
        ...biscuit.nutrition,
        sugarsG: 26.67,
      },
    };

    const result = normalizeNutrition(product);

    expect(result?.sugarsG).toBe(26.67);
  });

  it("preserves missing values", () => {
    const product: ProductAnalysisInput = {
      ...biscuit,
      nutrition: {
        ...biscuit.nutrition,
        sugarsG: null,
      },
    };

    const result = normalizeNutrition(product);

    expect(result?.sugarsG).toBeNull();
  });
});

describe("evaluateNutrition", () => {
  it("flags sugar above the illustrative threshold", () => {
    const result = evaluateNutrition(biscuit);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        nutrient: "sugarsG",
        level: "high",
        value: 26.67,
        basis: "per_100g",
      }),
    );
  });

  it.each(["mustard_oil", "olive_oil", "sunflower_oil"])(
    "returns needs_review for unsupported category %s",
    (category) => {
      const result = evaluateNutrition({
        productName: "Test cooking oil",
        category,
        productForm: "liquid",
        nutritionBasis: "per_100ml",
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
      });

      expect(result.status).toBe("needs_review");
      expect(result.findings).toEqual([]);
    },
  );

  it("marks results incomplete when a required value is missing", () => {
    const product: ProductAnalysisInput = {
      ...biscuit,
      nutrition: {
        ...biscuit.nutrition,
        sugarsG: null,
      },
    };

    expect(evaluateNutrition(product).status).toBe("incomplete");
  });

  it("requires review for an unsupported category", () => {
    const product: ProductAnalysisInput = {
      ...biscuit,
      category: "unknown-product",
    };

    const result = evaluateNutrition(product);

    expect(result.status).toBe("needs_review");
    expect(result.findings).toHaveLength(0);
  });
});

it("generates a headline for a single finding", () => {
  const product: ProductAnalysisInput = {
    ...biscuit,
    nutrition: {
      ...biscuit.nutrition,
      saturatedFatG: 1.5,
      transFatG: null,
      monounsaturatedFatG: null,
      polyunsaturatedFatG: null,
    },
  };

  const result = evaluateNutrition(product);

  expect(result.headline).toBe("High in sugar");
});

it("generates a headline for multiple findings", () => {
  const result = evaluateNutrition(biscuit);

  expect(result.headline).toBe("High in sugar and saturated fat");
});

it("reports no elevated nutrients when none exceed thresholds", () => {
  const product: ProductAnalysisInput = {
    ...biscuit,
    nutrition: {
      ...biscuit.nutrition,
      sugarsG: 3,
      saturatedFatG: 1,
      transFatG: null,
      monounsaturatedFatG: null,
      polyunsaturatedFatG: null,
      sodiumMg: 30,
    },
  };

  const result = evaluateNutrition(product);

  expect(result.status).toBe("complete");
  expect(result.headline).toBe(
    "No elevated nutrients identified under these criteria",
  );
});

it("uses an incomplete headline when data is missing", () => {
  const product: ProductAnalysisInput = {
    ...biscuit,
    nutrition: {
      ...biscuit.nutrition,
      sugarsG: null,
    },
  };

  const result = evaluateNutrition(product);

  expect(result.status).toBe("incomplete");
  expect(result.headline).toBe("Incomplete nutritional information");
});

it("uses a review headline for unsupported categories", () => {
  const product: ProductAnalysisInput = {
    ...biscuit,
    category: "unknown-product",
  };

  const result = evaluateNutrition(product);

  expect(result.status).toBe("needs_review");
  expect(result.headline).toBe("Unable to assess reliably");
});

it("does not flag sugar when it equals the threshold", () => {
  const product: ProductAnalysisInput = {
    ...biscuit,
    nutritionBasis: "per_100g",
    servingSize: null,
    nutrition: {
      ...biscuit.nutrition,
      sugarsG: 20,
      saturatedFatG: 1,
      transFatG: null,
      monounsaturatedFatG: null,
      polyunsaturatedFatG: null,
      sodiumMg: 100,
    },
  };

  const result = evaluateNutrition(product);

  expect(result.status).toBe("complete");
  expect(result.findings).not.toContainEqual(
    expect.objectContaining({
      nutrient: "sugarsG",
    }),
  );
});

describe("Indian benchmark profiles", () => {
  it("evaluates namkeen snacks and flags elevated fats and sodium", () => {
    const bhujia: ProductAnalysisInput = {
      productName: "Bikaneri Bhujia",
      category: "bhujia",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 30,
      nutrition: {
        caloriesKcal: 580,
        totalFatG: 42,
        saturatedFatG: 14,
        transFatG: 0.1,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 38,
        sugarsG: 2,
        addedSugarsG: 0,
        proteinG: 12,
        fiberG: 4,
        sodiumMg: 750,
      },
    };

    const result = evaluateNutrition(bhujia);

    expect(result.status).toBe("complete");
    expect(result.profile).toContain("namkeen_snacks");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrient: "totalFatG",
          level: "high",
          value: 42,
        }),
        expect.objectContaining({
          nutrient: "saturatedFatG",
          level: "high",
          value: 14,
        }),
        expect.objectContaining({
          nutrient: "sodiumMg",
          level: "high",
          value: 750,
        }),
      ]),
    );
  });

  it("evaluates packaged beverages and flags high sugar per 100ml", () => {
    const soda: ProductAnalysisInput = {
      productName: "Cola Drink",
      category: "cold drink",
      productForm: "liquid",
      nutritionBasis: "per_100ml",
      servingSize: 250,
      nutrition: {
        caloriesKcal: 44,
        totalFatG: 0,
        saturatedFatG: 0,
        transFatG: 0,
        monounsaturatedFatG: 0,
        polyunsaturatedFatG: 0,
        carbohydratesG: 11,
        sugarsG: 10.6,
        addedSugarsG: 10.6,
        proteinG: 0,
        fiberG: 0,
        sodiumMg: 15,
      },
    };

    const result = evaluateNutrition(soda);

    expect(result.status).toBe("complete");
    expect(result.profile).toContain("beverages");
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        nutrient: "sugarsG",
        level: "high",
        value: 10.6,
      }),
    );
  });

  it("evaluates instant noodles and flags critically high sodium", () => {
    const noodles: ProductAnalysisInput = {
      productName: "Masala Instant Noodles",
      category: "instant noodles",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 70,
      nutrition: {
        caloriesKcal: 420,
        totalFatG: 15,
        saturatedFatG: 7,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 62,
        sugarsG: 3,
        addedSugarsG: 1,
        proteinG: 8,
        fiberG: 3,
        sodiumMg: 950,
      },
    };

    const result = evaluateNutrition(noodles);

    expect(result.status).toBe("complete");
    expect(result.profile).toContain("instant_foods");
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        nutrient: "sodiumMg",
        level: "high",
        value: 950,
      }),
    );
  });
});
