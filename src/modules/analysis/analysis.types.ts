
export type ProductForm = "solid" | "liquid";

export type NutritionBasis =
  | "per_serving"
  | "per_100g"
  | "per_100ml";

export interface NutritionFacts {
  caloriesKcal: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  carbohydratesG: number | null;
  sugarsG: number | null;
  addedSugarsG: number | null;
  proteinG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
}

export interface ProductAnalysisInput {
  productName: string | null;
  category: string;
  productForm: ProductForm;
  nutritionBasis: NutritionBasis;
  servingSize: number | null;
  nutrition: NutritionFacts;
}

export interface NormalizedNutrition {
  basis: "per_100g" | "per_100ml";
  caloriesKcal: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  carbohydratesG: number | null;
  sugarsG: number | null;
  addedSugarsG: number | null;
  proteinG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
}

export type AnalysisStatus =
  | "complete"
  | "incomplete"
  | "needs_review";

export interface NutritionFinding {
  nutrient: string;
  label: string;
  level: "high";
  value: number;
  unit: "g" | "mg";
  basis: "per_100g" | "per_100ml";
  threshold: number;
  explanation: string;
}

export interface NutritionEvaluation {
  profile: string;
  status: AnalysisStatus;
  message?: string;
  findings: NutritionFinding[];
}
