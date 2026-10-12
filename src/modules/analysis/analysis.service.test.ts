
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
    },
  };

  const result = evaluateNutrition(product);

  expect(result.headline).toBe("High in sugar");
});

it("generates a headline for multiple findings", () => {
  const result = evaluateNutrition(biscuit);

  expect(result.headline).toBe(
    "High in sugar and saturated fat",
  );
});

it("reports no elevated nutrients when none exceed thresholds", () => {
  const product: ProductAnalysisInput = {
    ...biscuit,
    nutrition: {
      ...biscuit.nutrition,
      sugarsG: 3,
      saturatedFatG: 1,
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
  expect(result.headline).toBe(
    "Incomplete nutritional information",
  );
});

it("uses a review headline for unsupported categories", () => {
  const product: ProductAnalysisInput = {
    ...biscuit,
    category: "unknown-product",
  };

  const result = evaluateNutrition(product);

  expect(result.status).toBe("needs_review");
  expect(result.headline).toBe(
    "Unable to assess reliably",
  );
});
