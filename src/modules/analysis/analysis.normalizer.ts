
import type {
  NormalizedNutrition,
  ProductAnalysisInput,
} from "./analysis.types";

export function normalizeNutrition(
  product: ProductAnalysisInput,
): NormalizedNutrition | null {
  const { productForm, nutritionBasis, servingSize, nutrition } =
    product;

  const targetBasis =
    productForm === "solid" ? "per_100g" : "per_100ml";

  let factor = 1;

  if (nutritionBasis === "per_serving") {
    if (servingSize === null || servingSize <= 0) {
      return null;
    }

    factor = 100 / servingSize;
  } else if (nutritionBasis !== targetBasis) {
    return null;
  }

  return {
    basis: targetBasis,
    caloriesKcal:
      nutrition.caloriesKcal === null
        ? null
        : round(nutrition.caloriesKcal * factor),
    totalFatG:
      nutrition.totalFatG === null
        ? null
        : round(nutrition.totalFatG * factor),
    saturatedFatG:
      nutrition.saturatedFatG === null
        ? null
        : round(nutrition.saturatedFatG * factor),
    carbohydratesG:
      nutrition.carbohydratesG === null
        ? null
        : round(nutrition.carbohydratesG * factor),
    sugarsG:
      nutrition.sugarsG === null
        ? null
        : round(nutrition.sugarsG * factor),
    addedSugarsG:
      nutrition.addedSugarsG === null
        ? null
        : round(nutrition.addedSugarsG * factor),
    proteinG:
      nutrition.proteinG === null
        ? null
        : round(nutrition.proteinG * factor),
    fiberG:
      nutrition.fiberG === null
        ? null
        : round(nutrition.fiberG * factor),
    sodiumMg:
      nutrition.sodiumMg === null
        ? null
        : round(nutrition.sodiumMg * factor),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
