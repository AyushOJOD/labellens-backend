import { z } from "zod";

import type {
  NormalizedNutrition,
  ProductAnalysisInput,
} from "./analysis.types";

import { normalizeNutrition } from "./analysis.normalizer";

const evaluationRuleSchema = z.object({
  nutrient: z.enum([
    "caloriesKcal",
    "totalFatG",
    "saturatedFatG",
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
  explanation: z.string().min(1),
});

const evaluationProfileSchema = z.object({
  version: z.string().min(1),
  status: z.literal("illustrative"),
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

export function evaluateNutrition(product: ProductAnalysisInput) {
  const profileKey = product.category.trim().toLowerCase();
  const profile = profiles[profileKey];

  if (!profile) {
    return {
      profile: profileKey,
      status: "needs_review" as const,
      headline: "Unable to assess reliably",
      message: "No evaluation profile exists for this category.",
      findings: [],
    };
  }

  const profileId = `${profileKey}-${profile.version}`;
  const normalized = normalizeNutrition(product);

  if (!normalized) {
    return {
      profile: profileId,
      status: "needs_review" as const,
      headline: "Unable to assess reliably",
      message: "Nutrition basis is missing or incompatible.",
      findings: [],
    };
  }

  const rules = profile.rules;

  const findings = rules.flatMap((rule) => {
    const value: NormalizedNutrition[typeof rule.nutrient] =
      normalized[rule.nutrient];

    if (typeof value !== "number" || value <= rule.threshold) {
      return [];
    }

    return [
      {
        nutrient: rule.nutrient,
        label: rule.label,
        level: "high" as const,
        value,
        unit: rule.unit,
        basis: normalized.basis,
        threshold: rule.threshold,
        explanation: rule.explanation,
      },
    ];
  });

  const missingRules = rules.filter(
    (rule) => normalized[rule.nutrient] === null,
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
  };
}
