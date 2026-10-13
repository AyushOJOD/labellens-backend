import { getGemini } from "../../config/gemini";
import { productAnalysisSchema } from "./analysis.schema";
import { AnalysisError } from "./analysis.errors";

const extractionInstructions = `
You extract nutrition information from product label images.


Return exactly ONE JSON object representing ONE product.
Never return a JSON array.
Never return multiple candidate objects or alternative interpretations.
Do not wrap the object in an array.
Return only the object, with no Markdown or surrounding explanation.


Rules:
- Extract values exactly as printed. Never guess missing values.
- Use null for unreadable or absent numeric values.
- The nutritionBasis field MUST be exactly one of these strings:
  "per_serving", "per_100g", or "per_100ml".
- Use "per_serving" when values are given per serving or per
  stated portion.
- Use "per_100g" when values are given per 100 grams.
- Use "per_100ml" when values are given per 100 millilitres.
- Never return human-readable alternatives such as "per 100 g",
  "per 100ml", or "per serving".
- If the basis cannot be determined reliably, do not guess.
  Return "per_serving" only if a serving basis is actually
  stated; otherwise flag the extraction for review in a future
  schema update.
- servingSize must be a positive number when the label gives it.
- Use solid or liquid for productForm.
- Choose a concise category, such as biscuits, beverage,
  cereal, snack, or unknown.
- Convert energy to kcal, nutrients to grams, and sodium to
  milligrams only when conversion is reliable.
- Do not confuse salt with sodium. If sodium cannot be
  determined reliably, return null for sodiumMg.
- Do not infer added sugars from total sugars.
- If the image is not a nutrition label, use category "unknown",
  productName null, and null for all numeric nutrition values.
- Never invent product names, units, or nutrient values.

Required fields:
productName, category, productForm, nutritionBasis, servingSize,
nutrition (caloriesKcal, totalFatG, saturatedFatG,
carbohydratesG, sugarsG, addedSugarsG, proteinG, fiberG, sodiumMg).
`;

export async function extractNutritionFromImage(image: Express.Multer.File) {
  const base64Image = image.buffer.toString("base64");

  const gemini = await getGemini();

  let response:
    | Awaited<ReturnType<typeof gemini.models.generateContent>>
    | undefined;

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              mimeType: image.mimetype,
              data: base64Image,
            },
          },
          extractionInstructions,
        ],
        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "OBJECT",
            properties: {
              productName: { type: "STRING", nullable: true },
              category: { type: "STRING" },
              productForm: {
                type: "STRING",
                enum: ["solid", "liquid"],
              },
              nutritionBasis: {
                type: "STRING",
                enum: ["per_serving", "per_100g", "per_100ml"],
              },
              servingSize: { type: "NUMBER", nullable: true },
              nutrition: {
                type: "OBJECT",
                properties: {
                  caloriesKcal: { type: "NUMBER", nullable: true },
                  totalFatG: { type: "NUMBER", nullable: true },
                  saturatedFatG: { type: "NUMBER", nullable: true },
                  carbohydratesG: { type: "NUMBER", nullable: true },
                  sugarsG: { type: "NUMBER", nullable: true },
                  addedSugarsG: { type: "NUMBER", nullable: true },
                  proteinG: { type: "NUMBER", nullable: true },
                  fiberG: { type: "NUMBER", nullable: true },
                  sodiumMg: { type: "NUMBER", nullable: true },
                },
                required: [
                  "caloriesKcal",
                  "totalFatG",
                  "saturatedFatG",
                  "carbohydratesG",
                  "sugarsG",
                  "addedSugarsG",
                  "proteinG",
                  "fiberG",
                  "sodiumMg",
                ],
              },
            },
            required: [
              "productName",
              "category",
              "productForm",
              "nutritionBasis",
              "servingSize",
              "nutrition",
            ],
          },

          temperature: 0,
        },
      });

      break;
    } catch (error: unknown) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : undefined;

      if (status === 503 && attempt < maxAttempts) {
        console.warn("Gemini temporarily unavailable. Retrying once...");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      console.error("Gemini API request failed:", error);

      throw new AnalysisError(
        "AI_UNAVAILABLE",
        "Gemini could not process the image.",
      );
    }
  }

  if (!response) {
    throw new AnalysisError(
      "AI_UNAVAILABLE",
      "Gemini did not return a response.",
    );
  }

  const output = response.text;

  if (!output) {
    throw new AnalysisError(
      "INVALID_AI_RESPONSE",
      "Gemini returned an empty response.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(output);
  } catch {
    throw new AnalysisError(
      "INVALID_AI_RESPONSE",
      "Gemini returned invalid JSON.",
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    console.error("Unexpected Gemini response structure:", {
      type: typeof parsed,
      isArray: Array.isArray(parsed),
      preview: output.slice(0, 500),
    });

    throw new AnalysisError(
      "INVALID_AI_RESPONSE",
      "Gemini returned an invalid response structure.",
    );
  }

  const validation = productAnalysisSchema.safeParse(parsed);

  if (!validation.success) {
    throw new AnalysisError(
      "INVALID_AI_RESPONSE",
      "Gemini returned invalid nutrition data.",
    );
  }

  return validation.data;
}
