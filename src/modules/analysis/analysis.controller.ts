
import type { Request, Response } from "express";
import { productAnalysisSchema } from "./analysis.schema";
import { evaluateNutrition } from "./analysis.service";

export function analyzeProduct(req: Request, res: Response) {
  const result = productAnalysisSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid nutrition data",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const evaluation = evaluateNutrition(result.data);

  return res.status(200).json({
    success: true,
    data: result.data,
    evaluation,
  });
}
