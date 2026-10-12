
import { z } from "zod";

const optionalNutrient = z
  .number()
  .finite()
  .nonnegative()
  .nullable();

export const nutritionFactsSchema = z.object({
  caloriesKcal: optionalNutrient,
  totalFatG: optionalNutrient,
  saturatedFatG: optionalNutrient,
  carbohydratesG: optionalNutrient,
  sugarsG: optionalNutrient,
  addedSugarsG: optionalNutrient,
  proteinG: optionalNutrient,
  fiberG: optionalNutrient,
  sodiumMg: optionalNutrient,
});

export const productAnalysisSchema = z
  .object({
    productName: z.string().trim().min(1).nullable(),
    category: z.string().trim().min(1),
    productForm: z.enum(["solid", "liquid"]),
    nutritionBasis: z.enum([
      "per_serving",
      "per_100g",
      "per_100ml",
    ]),
    servingSize: z.number().finite().positive().nullable(),
    nutrition: nutritionFactsSchema,
  })
  .superRefine((data, ctx) => {
    if (
      data.nutritionBasis === "per_serving" &&
      data.servingSize === null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["servingSize"],
        message: "Serving size is required for per-serving values.",
      });
    }

    if (
      data.nutritionBasis === "per_100g" &&
      data.productForm !== "solid"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["nutritionBasis"],
        message: "Per 100 g values require a solid product.",
      });
    }

    if (
      data.nutritionBasis === "per_100ml" &&
      data.productForm !== "liquid"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["nutritionBasis"],
        message: "Per 100 ml values require a liquid product.",
      });
    }
  });

export type ValidatedProductAnalysis = z.infer<
  typeof productAnalysisSchema
>;
