export type ProductForm = "solid" | "liquid";

export type NutritionBasis = "per_serving" | "per_100g" | "per_100ml";

export interface NutritionFacts {
  caloriesKcal: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  transFatG: number | null;
  monounsaturatedFatG: number | null;
  polyunsaturatedFatG: number | null;
  carbohydratesG: number | null;
  sugarsG: number | null;
  addedSugarsG: number | null;
  proteinG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
}

export interface IngredientAdditive {
  code: string;
  name: string;
  category: "sweetener" | "color" | "flavor_enhancer" | "preservative" | "emulsifier" | "other";
  description: string;
}

export interface IngredientsAnalysis {
  rawIngredientsText: string | null;
  hasPalmOil: boolean;
  palmOilType?: string;
  hiddenSugars: string[];
  additives: IngredientAdditive[];
  allergens: string[];
  summary: string;
}

export interface ProductAnalysisInput {
  productName: string | null;
  category: string;
  productForm: ProductForm;
  nutritionBasis: NutritionBasis;
  servingSize: number | null;
  ingredientsText?: string | null;
  barcode?: string | null;
  nutrition: NutritionFacts;
}

export interface NormalizedNutrition {
  basis: "per_100g" | "per_100ml";
  caloriesKcal: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  transFatG: number | null;
  monounsaturatedFatG: number | null;
  polyunsaturatedFatG: number | null;
  carbohydratesG: number | null;
  sugarsG: number | null;
  addedSugarsG: number | null;
  proteinG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
}

export type AnalysisStatus = "complete" | "incomplete" | "needs_review";

export interface NutritionFinding {
  nutrient: string;
  label: string;
  level: "high" | "moderate" | "other";
  value: number;
  unit: "g" | "mg";
  basis: "per_100g" | "per_100ml";
  threshold: number;
  explanation: string;
}

export interface NutritionEvaluation {
  profile: string;
  status: AnalysisStatus;
  headline?: string;
  message?: string;
  missingNutrients?: string[];
  normalizedNutrition?: NormalizedNutrition;
  findings: NutritionFinding[];
  ingredientsAnalysis?: IngredientsAnalysis;
}
