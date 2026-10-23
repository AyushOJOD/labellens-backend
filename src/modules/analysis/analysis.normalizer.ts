import type {
  NormalizedNutrition,
  ProductAnalysisInput,
} from "./analysis.types";

export function normalizeNutrition(
  product: ProductAnalysisInput,
): NormalizedNutrition | null {
  const { productForm, nutritionBasis, servingSize, nutrition } = product;

  const targetBasis =
    nutritionBasis === "per_100g" || nutritionBasis === "per_100ml"
      ? nutritionBasis
      : productForm === "solid"
        ? "per_100g"
        : "per_100ml";

  let factor = 1;

  if (nutritionBasis === "per_serving") {
    if (servingSize === null || servingSize <= 0) {
      return null;
    }

    factor = 100 / servingSize;
  } else if (nutritionBasis !== "per_100g" && nutritionBasis !== "per_100ml") {
    return null;
  }

  return {
    basis: targetBasis,
    caloriesKcal: scale(nutrition.caloriesKcal, factor),
    totalFatG: scale(nutrition.totalFatG, factor),
    saturatedFatG: scale(nutrition.saturatedFatG, factor),
    transFatG: scale(nutrition.transFatG, factor),
    monounsaturatedFatG: scale(nutrition.monounsaturatedFatG, factor),
    polyunsaturatedFatG: scale(nutrition.polyunsaturatedFatG, factor),
    carbohydratesG: scale(nutrition.carbohydratesG, factor),
    sugarsG: scale(nutrition.sugarsG, factor),
    addedSugarsG: scale(nutrition.addedSugarsG, factor),
    proteinG: scale(nutrition.proteinG, factor),
    fiberG: scale(nutrition.fiberG, factor),
    sodiumMg: scale(nutrition.sodiumMg, factor),
  };
}

function scale(value: number | null, factor: number): number | null {
  return value === null ? null : round(value * factor);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
