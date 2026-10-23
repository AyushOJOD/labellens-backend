import { z } from "zod";

import type {
  NormalizedNutrition,
  NutritionEvaluation,
  ProductAnalysisInput,
  ProductForm,
} from "./analysis.types";

import { normalizeNutrition } from "./analysis.normalizer";
import { analyzeIngredients } from "./analysis.ingredients.service";

const evaluationRuleSchema = z.object({
  nutrient: z.enum([
    "caloriesKcal",
    "totalFatG",
    "saturatedFatG",
    "transFatG",
    "monounsaturatedFatG",
    "polyunsaturatedFatG",
    "carbohydratesG",
    "sugarsG",
    "addedSugarsG",
    "proteinG",
    "fiberG",
    "sodiumMg",
  ]),
  label: z.string().min(1),
  threshold: z.number().finite().nonnegative(),
  unit: z.enum(["g", "mg"]),
  level: z.enum(["high", "moderate", "other"]).optional().default("high"),
  required: z.boolean().optional().default(true),
  explanation: z.string().min(1),
});

const evaluationProfileSchema = z.object({
  version: z.string().min(1),
  status: z.string().min(1),
  rules: z.array(evaluationRuleSchema).min(1),
});

const profilesSchema = z.record(z.string(), evaluationProfileSchema);

const rawProfiles: unknown = require("./profiles/profiles.json");
const profilesResult = profilesSchema.safeParse(rawProfiles);

if (!profilesResult.success) {
  throw new Error(
    `Invalid LabelLens evaluation profiles: ${profilesResult.error.message}`,
  );
}

const profiles = profilesResult.data;

// Category aliases for Indian food retail market
const CATEGORY_ALIASES: Record<string, string> = {
  // Biscuits, cookies, bakery
  biscuit: "biscuits",
  biscuits: "biscuits",
  cookie: "biscuits",
  cookies: "biscuits",
  rusk: "biscuits",
  rusks: "biscuits",
  cracker: "biscuits",
  crackers: "biscuits",
  wafer_biscuit: "biscuits",

  // Savory snacks & namkeen
  snack: "namkeen_snacks",
  snacks: "namkeen_snacks",
  namkeen: "namkeen_snacks",
  chips: "namkeen_snacks",
  potato_chips: "namkeen_snacks",
  bhujia: "namkeen_snacks",
  sev: "namkeen_snacks",
  mixture: "namkeen_snacks",
  crisps: "namkeen_snacks",
  wafer: "namkeen_snacks",
  wafers: "namkeen_snacks",
  puffs: "namkeen_snacks",
  kurkure: "namkeen_snacks",
  popcorn: "namkeen_snacks",

  // Beverages
  beverage: "beverages",
  beverages: "beverages",
  drink: "beverages",
  drinks: "beverages",
  juice: "beverages",
  juices: "beverages",
  soda: "beverages",
  soft_drink: "beverages",
  cold_drink: "beverages",
  energy_drink: "beverages",
  carbonated_beverage: "beverages",

  // Instant foods
  instant_noodles: "instant_foods",
  noodles: "instant_foods",
  instant_food: "instant_foods",
  instant_foods: "instant_foods",
  maggi: "instant_foods",
  pasta: "instant_foods",
  instant_soup: "instant_foods",
  soup: "instant_foods",
  ready_to_eat: "instant_foods",

  // Sweets & Confectionery
  chocolate: "sweets_confectionery",
  chocolates: "sweets_confectionery",
  candy: "sweets_confectionery",
  candies: "sweets_confectionery",
  sweet: "sweets_confectionery",
  sweets: "sweets_confectionery",
  confectionery: "sweets_confectionery",
  mithai: "sweets_confectionery",

  // Breakfast cereals
  cereal: "breakfast_cereals",
  cereals: "breakfast_cereals",
  breakfast_cereal: "breakfast_cereals",
  breakfast_cereals: "breakfast_cereals",
  cornflakes: "breakfast_cereals",
  muesli: "breakfast_cereals",
  oats: "breakfast_cereals",

  // Dairy
  dairy: "dairy",
  milk: "dairy",
  flavored_milk: "dairy",
  curd: "dairy",
  yogurt: "dairy",
  dahi: "dairy",
  cheese: "dairy",

  // Sauces & Condiments
  sauce: "sauces_condiments",
  sauces: "sauces_condiments",
  ketchup: "sauces_condiments",
  condiment: "sauces_condiments",
  condiments: "sauces_condiments",
  mayonnaise: "sauces_condiments",

  // General solid / liquid fallbacks
  general_solid: "solid_general",
  packaged_food: "solid_general",
  food: "solid_general",
  solid_food: "solid_general",
  general_liquid: "liquid_general",
  liquid_food: "liquid_general",
};

export function resolveProfileKey(
  category: string,
  _productForm?: ProductForm,
): string | null {
  const clean = category.trim().toLowerCase();
  const normalized = clean.replace(/[\s-]+/g, "_");

  if (
    normalized === "unknown_product" ||
    normalized === "unknown-product" ||
    normalized === "unknown" ||
    normalized.includes("unknown") ||
    normalized.includes("oil") ||
    normalized === "ghee" ||
    normalized === "butter"
  ) {
    return null;
  }

  if (profiles[normalized]) {
    return normalized;
  }

  if (CATEGORY_ALIASES[normalized] && profiles[CATEGORY_ALIASES[normalized]]) {
    return CATEGORY_ALIASES[normalized];
  }

  for (const [alias, targetKey] of Object.entries(CATEGORY_ALIASES)) {
    if (normalized.includes(alias) && profiles[targetKey]) {
      return targetKey;
    }
  }

  return null;
}

export function evaluateNutrition(product: ProductAnalysisInput): NutritionEvaluation {
  const ingredientsAnalysis = analyzeIngredients(product.ingredientsText);
  const profileKey = resolveProfileKey(product.category, product.productForm);

  if (!profileKey || !profiles[profileKey]) {
    return {
      profile: product.category.trim().toLowerCase(),
      status: "needs_review" as const,
      headline: "Unable to assess reliably",
      message: "No evaluation profile exists for this category.",
      findings: [],
      ingredientsAnalysis,
    };
  }

  const profile = profiles[profileKey];
  const profileId = `${profileKey}-${profile.version}`;
  const normalized = normalizeNutrition(product);

  if (!normalized) {
    return {
      profile: profileId,
      status: "needs_review" as const,
      headline: "Unable to assess reliably",
      message: "Nutrition basis is missing or incompatible.",
      findings: [],
      ingredientsAnalysis,
    };
  }

  const rules = profile.rules;

  const findings = rules.flatMap((rule) => {
    const value: NormalizedNutrition[typeof rule.nutrient] =
      normalized[rule.nutrient];

    if (typeof value !== "number" || value <= rule.threshold) {
      return [];
    }

    let explanation = rule.explanation;
    if (
      rule.nutrient === "sugarsG" &&
      value > 0 &&
      !rule.explanation.includes("teaspoon")
    ) {
      const tsp = (value / 4).toFixed(1);
      explanation = `${explanation} (~${tsp} tsp sugar per ${
        normalized.basis === "per_100ml" ? "100ml" : "100g"
      }).`;
    } else if (
      rule.nutrient === "sodiumMg" &&
      value > 0 &&
      !rule.explanation.includes("ICMR")
    ) {
      const pctDaily = Math.round((value / 2000) * 100);
      explanation = `${explanation} (~${pctDaily}% of ICMR 2,000 mg daily sodium limit).`;
    }

    return [
      {
        nutrient: rule.nutrient,
        label: rule.label,
        level: (rule.level || "high") as "high" | "moderate" | "other",
        value,
        unit: rule.unit,
        basis: normalized.basis,
        threshold: rule.threshold,
        explanation,
      },
    ];
  });

  const missingRules = rules.filter(
    (rule) => rule.required !== false && normalized[rule.nutrient] === null,
  );

  if (missingRules.length > 0) {
    return {
      profile: profileId,
      status: "incomplete" as const,
      headline: "Incomplete nutritional information",
      message:
        "Some nutrients could not be read, so the analysis may be incomplete.",
      missingNutrients: missingRules.map((rule) => rule.label),
      normalizedNutrition: normalized,
      findings,
      ingredientsAnalysis,
    };
  }

  const headline =
    findings.length === 0
      ? "No elevated nutrients identified under these criteria"
      : `High in ${findings.map((finding) => finding.label).join(" and ")}`;

  return {
    profile: profileId,
    status: "complete" as const,
    headline,
    normalizedNutrition: normalized,
    findings,
    ingredientsAnalysis,
  };
}
