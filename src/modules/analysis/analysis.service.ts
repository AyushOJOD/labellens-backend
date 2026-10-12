
import type {
  NormalizedNutrition,
  ProductAnalysisInput,
} from "./analysis.types";
import { normalizeNutrition } from "./analysis.normalizer";

// DEVELOPMENT EXAMPLE ONLY — NOT OFFICIAL GUIDANCE.
const illustrativeRules = {
  biscuits: [
    {
      nutrient: "sugarsG",
      label: "sugar",
      threshold: 20,
      unit: "g",
      explanation:
        "Sugar exceeds the illustrative development threshold.",
    },
    {
      nutrient: "saturatedFatG",
      label: "saturated fat",
      threshold: 5,
      unit: "g",
      explanation:
        "Saturated fat exceeds the illustrative development threshold.",
    },
    {
      nutrient: "sodiumMg",
      label: "sodium",
      threshold: 600,
      unit: "mg",
      explanation:
        "Sodium exceeds the illustrative development threshold.",
    },
  ],
};

export function evaluateNutrition(product: ProductAnalysisInput) {
  const normalized = normalizeNutrition(product);

  if (!normalized) {
    return {
      profile: "illustrative-development-v1",
      status: "needs_review" as const,
      headline: "Unable to assess reliably",
      message: "Nutrition basis is missing or incompatible.",
      findings: [],
    };
  }

  const rules =
    illustrativeRules[
      product.category.trim().toLowerCase() as keyof typeof illustrativeRules
    ];

  if (!rules) {
    return {
      profile: "illustrative-development-v1",
      status: "needs_review" as const,
      headline: "Unable to assess reliably",
      message: "No evaluation profile exists for this category.",
      findings: [],
    };
  }

  const findings = rules.flatMap((rule) => {
    const value = normalized[
      rule.nutrient as keyof NormalizedNutrition
    ];

    if (typeof value !== "number" || value <= rule.threshold) {
      return [];
    }

    return [{
      nutrient: rule.nutrient,
      label: rule.label,
      level: "high" as const,
      value,
      unit: rule.unit,
      basis: normalized.basis,
      threshold: rule.threshold,
      explanation: rule.explanation,
    }];
  });

  const hasMissingValues = rules.some(
    (rule) =>
      normalized[
        rule.nutrient as keyof NormalizedNutrition
      ] === null,
  );

  if (hasMissingValues) {
    return {
      profile: "illustrative-development-v1",
      status: "incomplete" as const,
      headline: "Incomplete nutritional information",
      normalizedNutrition: normalized,
      findings,
    };
  }

  const headline =
    findings.length === 0
      ? "No elevated nutrients identified under these criteria"
      : `High in ${findings
          .map((finding) => finding.label)
          .join(" and ")}`;

  return {
    profile: "illustrative-development-v1",
    status: "complete" as const,
    headline,
    normalizedNutrition: normalized,
    findings,
  };
}
