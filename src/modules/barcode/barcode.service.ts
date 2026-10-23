import type { ProductAnalysisInput, ProductForm } from "../analysis/analysis.types";
import { evaluateNutrition } from "../analysis/analysis.service";
import { getProductByBarcode } from "../products/open-food-facts.client";
import { findProductById } from "../products/products.repository";
import { getCachedProductByBarcode, cacheProduct } from "../products/products.cache";

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function deriveCategory(tags?: string[], name?: string): string {
  const text = `${(tags || []).join(" ")} ${name || ""}`.toLowerCase();

  if (text.includes("biscuit") || text.includes("cookie") || text.includes("rusk")) {
    return "biscuits";
  }
  if (
    text.includes("chip") ||
    text.includes("crisp") ||
    text.includes("snack") ||
    text.includes("namkeen") ||
    text.includes("bhujia") ||
    text.includes("sev")
  ) {
    return "namkeen_snacks";
  }
  if (
    text.includes("beverage") ||
    text.includes("drink") ||
    text.includes("soda") ||
    text.includes("cola") ||
    text.includes("juice")
  ) {
    return "beverages";
  }
  if (text.includes("noodle") || text.includes("pasta") || text.includes("soup") || text.includes("maggi")) {
    return "instant_foods";
  }
  if (text.includes("chocolate") || text.includes("candy") || text.includes("sweet") || text.includes("confectionery")) {
    return "sweets_confectionery";
  }
  if (text.includes("cereal") || text.includes("muesli") || text.includes("oat") || text.includes("cornflake")) {
    return "breakfast_cereals";
  }
  if (text.includes("dairy") || text.includes("milk") || text.includes("yogurt") || text.includes("cheese") || text.includes("curd")) {
    return "dairy";
  }
  if (text.includes("sauce") || text.includes("ketchup") || text.includes("condiment") || text.includes("mayonnaise")) {
    return "sauces_condiments";
  }

  return "packaged_food";
}

function deriveProductForm(category: string, unit?: string, quantity?: string): ProductForm {
  const text = `${category} ${unit || ""} ${quantity || ""}`.toLowerCase();
  if (category === "beverages" || text.includes("ml") || text.includes("liter") || text.includes("litre")) {
    return "liquid";
  }
  return "solid";
}

export async function lookupBarcodeAndAnalyze(barcode: string) {
  const normalizedBarcode = barcode.trim();

  // 1. Check local persistent auto-cache (Instant ~0.5ms!)
  const cachedProduct = getCachedProductByBarcode(normalizedBarcode);
  if (cachedProduct) {
    const evaluation = evaluateNutrition(cachedProduct);
    return {
      success: true,
      source: "local_persistent_cache",
      barcode: normalizedBarcode,
      data: cachedProduct,
      evaluation,
    };
  }

  // 2. Check local seed catalog
  const localProduct = findProductById(normalizedBarcode);
  if (localProduct) {
    const input: ProductAnalysisInput = {
      productName: `${localProduct.brand} ${localProduct.name}`,
      category: localProduct.category,
      productForm: localProduct.productForm,
      nutritionBasis: localProduct.nutritionBasis || "per_100g",
      servingSize: localProduct.servingSize,
      ingredientsText: null,
      nutrition: localProduct.nutrition,
    };

    // Auto-cache into persistent store
    cacheProduct(normalizedBarcode, input, "curated_seed");

    const evaluation = evaluateNutrition(input);
    return {
      success: true,
      source: "local_seed_catalog",
      barcode: normalizedBarcode,
      data: input,
      evaluation,
    };
  }

  // 3. Query Open Food Facts
  const offProduct = await getProductByBarcode(normalizedBarcode);
  if (!offProduct) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: `Barcode ${normalizedBarcode} was not found in the database. Please scan the photo of the nutrition label directly.`,
    };
  }

  const nutriments = offProduct.nutriments || {};
  const category = deriveCategory(offProduct.categories_tags_en, offProduct.product_name);
  const productForm = deriveProductForm(
    category,
    offProduct.product_quantity_unit,
    offProduct.quantity,
  );

  // Derive sodium in milligrams (Open Food Facts gives sodium or salt in grams per 100g)
  let sodiumMg: number | null = null;
  const rawSodiumG = parseNumber(nutriments["sodium_100g"]);
  const rawSaltG = parseNumber(nutriments["salt_100g"]);

  if (rawSodiumG != null) {
    sodiumMg = Math.round(rawSodiumG * 1000);
  } else if (rawSaltG != null) {
    // Salt is ~40% sodium (NaCl -> 23 / 58.44 = 0.3934)
    sodiumMg = Math.round(rawSaltG * 400);
  }

  const nutrition = {
    caloriesKcal: parseNumber(nutriments["energy-kcal_100g"]) ?? parseNumber(nutriments["energy-kcal"]),
    totalFatG: parseNumber(nutriments["fat_100g"]) ?? parseNumber(nutriments["fat"]),
    saturatedFatG: parseNumber(nutriments["saturated-fat_100g"]) ?? parseNumber(nutriments["saturated-fat"]),
    transFatG: parseNumber(nutriments["trans-fat_100g"]) ?? parseNumber(nutriments["trans-fat"]),
    monounsaturatedFatG: parseNumber(nutriments["monounsaturated-fat_100g"]),
    polyunsaturatedFatG: parseNumber(nutriments["polyunsaturated-fat_100g"]),
    carbohydratesG: parseNumber(nutriments["carbohydrates_100g"]) ?? parseNumber(nutriments["carbohydrates"]),
    sugarsG: parseNumber(nutriments["sugars_100g"]) ?? parseNumber(nutriments["sugars"]),
    addedSugarsG: parseNumber(nutriments["added-sugars_100g"]),
    proteinG: parseNumber(nutriments["proteins_100g"]) ?? parseNumber(nutriments["proteins"]),
    fiberG: parseNumber(nutriments["fiber_100g"]) ?? parseNumber(nutriments["fiber"]),
    sodiumMg,
  };

  const ingredientsText = offProduct.ingredients_text || offProduct.ingredients_text_en || null;
  const productName = [offProduct.brands, offProduct.product_name].filter(Boolean).join(" - ") || "Unknown Product";

  const input: ProductAnalysisInput = {
    productName,
    category,
    productForm,
    nutritionBasis: productForm === "liquid" ? "per_100ml" : "per_100g",
    servingSize: parseNumber(offProduct.product_quantity),
    ingredientsText,
    nutrition,
  };

  // Auto-cache into persistent local database so all future lookups are instant!
  cacheProduct(normalizedBarcode, input, "open_food_facts");

  const evaluation = evaluateNutrition(input);

  return {
    success: true,
    source: "open_food_facts",
    barcode: normalizedBarcode,
    data: input,
    evaluation,
  };
}
