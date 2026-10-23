import fs from "fs";
import path from "path";
import type { ProductAnalysisInput } from "../analysis/analysis.types";

export interface CachedProductRecord {
  barcode: string;
  data: ProductAnalysisInput;
  source: "open_food_facts" | "user_scan" | "curated_seed";
  cachedAt: string;
}

interface CacheStore {
  version: string;
  lastUpdated: string;
  totalCached: number;
  products: Record<string, CachedProductRecord>;
}

const CACHE_FILE_PATH = path.resolve(
  __dirname,
  "../../../data/products.cache.json",
);

export const DEFAULT_INDIAN_STAPLES: Record<string, CachedProductRecord> = {
  "8901719101018": {
    barcode: "8901719101018",
    data: {
      productName: "Parle-G Original Glucose Biscuits",
      category: "biscuits",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 100,
      ingredientsText: "Wheat Flour (67%), Sugar (24%), Edible Vegetable Oil (Palm Oil), Invert Sugar Syrup, Raising Agents, Salt, Milk Solids",
      nutrition: {
        caloriesKcal: 454,
        totalFatG: 13,
        saturatedFatG: 6.2,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 77.3,
        sugarsG: 26.5,
        addedSugarsG: 24,
        proteinG: 6.9,
        fiberG: null,
        sodiumMg: 280,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901058863618": {
    barcode: "8901058863618",
    data: {
      productName: "Maggi 2-Minute Masala Noodles",
      category: "instant_foods",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 70,
      ingredientsText: "Wheat Flour (Maida), Palm Oil, Salt, Wheat Gluten, Mineral (Calcium Carbonate), Thickener (508), Acidity Regulators (501(i), 500(i)), Humectant (451(i)). Tastemaker: Mixed Spices, Hydrolysed Groundnut Protein, Noodle Powder, Sugar, Edible Starch, Flavour Enhancer (635)",
      nutrition: {
        caloriesKcal: 427,
        totalFatG: 15.7,
        saturatedFatG: 6.8,
        transFatG: 0.1,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 63.5,
        sugarsG: 2.2,
        addedSugarsG: 1.1,
        proteinG: 8,
        fiberG: 3.6,
        sodiumMg: 950,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901491101831": {
    barcode: "8901491101831",
    data: {
      productName: "Lay's India's Magic Masala Potato Chips",
      category: "namkeen_snacks",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 30,
      ingredientsText: "Potato, Edible Vegetable Oil (Palmolein), Seasoning (Spices and Condiments, Sugar, Iodised Salt, Maltodextrin, Flavour Enhancers (627, 631), Acidity Regulator (330))",
      nutrition: {
        caloriesKcal: 555,
        totalFatG: 35.7,
        saturatedFatG: 17,
        transFatG: 0.1,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 51.5,
        sugarsG: 3.5,
        addedSugarsG: 2.5,
        proteinG: 6.9,
        fiberG: 4.1,
        sodiumMg: 695,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901491001032": {
    barcode: "8901491001032",
    data: {
      productName: "Kurkure Masala Munch",
      category: "namkeen_snacks",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 30,
      ingredientsText: "Rice Meal (43.2%), Edible Vegetable Oil (Palmolein), Corn Meal (20%), Gram Meal (3.3%), Spices and Condiments, Iodised Salt, Sugar, Flavour Enhancer (627, 631)",
      nutrition: {
        caloriesKcal: 561,
        totalFatG: 36.1,
        saturatedFatG: 16.5,
        transFatG: 0.1,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 53.4,
        sugarsG: 2.1,
        addedSugarsG: 1.5,
        proteinG: 5.8,
        fiberG: 2.5,
        sodiumMg: 825,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8904004400571": {
    barcode: "8904004400571",
    data: {
      productName: "Haldiram's Nagpur Aloo Bhujia",
      category: "namkeen_snacks",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 35,
      ingredientsText: "Potatoes (44%), Edible Vegetable Oil (Cotton Seed, Corn and Palmolein Oil), Chickpeas Flour, Tepary Beans Flour, Edible Starch, Spices and Condiments, Iodised Salt, Acidity Regulator (INS 330)",
      nutrition: {
        caloriesKcal: 588,
        totalFatG: 43.6,
        saturatedFatG: 18.2,
        transFatG: 0.1,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 41.3,
        sugarsG: 1.5,
        addedSugarsG: 0,
        proteinG: 7.7,
        fiberG: 3.8,
        sodiumMg: 752,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "7622201140021": {
    barcode: "7622201140021",
    data: {
      productName: "Cadbury Dairy Milk Chocolate",
      category: "sweets_confectionery",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 24,
      ingredientsText: "Sugar, Milk Solids (22%), Cocoa Butter, Cocoa Solids, Emulsifiers (442, 476), Flavours",
      nutrition: {
        caloriesKcal: 532,
        totalFatG: 30.5,
        saturatedFatG: 18.9,
        transFatG: 0.2,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 58.5,
        sugarsG: 57.4,
        addedSugarsG: 47.5,
        proteinG: 8,
        fiberG: 2.1,
        sodiumMg: 148,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "5449000000996": {
    barcode: "5449000000996",
    data: {
      productName: "Coca-Cola Original Taste",
      category: "beverages",
      productForm: "liquid",
      nutritionBasis: "per_100ml",
      servingSize: 250,
      ingredientsText: "Carbonated Water, Sugar, Acidity Regulator (338), Colour (150d), Flavours, Caffeine",
      nutrition: {
        caloriesKcal: 44,
        totalFatG: 0,
        saturatedFatG: 0,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 10.9,
        sugarsG: 10.6,
        addedSugarsG: 10.6,
        proteinG: 0,
        fiberG: 0,
        sodiumMg: 11,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901764012239": {
    barcode: "8901764012239",
    data: {
      productName: "Thums Up Charged",
      category: "beverages",
      productForm: "liquid",
      nutritionBasis: "per_100ml",
      servingSize: 250,
      ingredientsText: "Carbonated Water, Sugar, Acidity Regulator (338), Colour (150d), Flavours, Caffeine",
      nutrition: {
        caloriesKcal: 40,
        totalFatG: 0,
        saturatedFatG: 0,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 10,
        sugarsG: 10,
        addedSugarsG: 10,
        proteinG: 0,
        fiberG: 0,
        sodiumMg: 14,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901719283004": {
    barcode: "8901719283004",
    data: {
      productName: "Frooti Mango Drink",
      category: "beverages",
      productForm: "liquid",
      nutritionBasis: "per_100ml",
      servingSize: 160,
      ingredientsText: "Water, Mango Pulp (19.5%), Sugar, Acidity Regulator (330), Antioxidant (300)",
      nutrition: {
        caloriesKcal: 65,
        totalFatG: 0,
        saturatedFatG: 0,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 16.2,
        sugarsG: 15.2,
        addedSugarsG: 12.8,
        proteinG: 0.2,
        fiberG: 0.5,
        sodiumMg: 18,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901063012117": {
    barcode: "8901063012117",
    data: {
      productName: "Britannia Good Day Butter Cookies",
      category: "biscuits",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 75,
      ingredientsText: "Refined Wheat Flour (Maida), Sugar, Edible Vegetable Oil (Palm), Butter (2%), Invert Sugar Syrup, Milk Solids, Raising Agents (503(ii), 500(ii)), Salt, Emulsifiers (322, 471)",
      nutrition: {
        caloriesKcal: 494,
        totalFatG: 22,
        saturatedFatG: 10.5,
        transFatG: 0.1,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 67,
        sugarsG: 23,
        addedSugarsG: 21.5,
        proteinG: 7,
        fiberG: 1.5,
        sodiumMg: 310,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901262010041": {
    barcode: "8901262010041",
    data: {
      productName: "Amul Taaza Homogenised Toned Milk",
      category: "dairy",
      productForm: "liquid",
      nutritionBasis: "per_100ml",
      servingSize: 200,
      ingredientsText: "Toned Milk, Vitamin A, Vitamin D",
      nutrition: {
        caloriesKcal: 58.2,
        totalFatG: 3,
        saturatedFatG: 1.9,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 4.7,
        sugarsG: 4.7,
        addedSugarsG: 0,
        proteinG: 3.1,
        fiberG: 0,
        sodiumMg: 52,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "8901030383745": {
    barcode: "8901030383745",
    data: {
      productName: "Kissan Fresh Tomato Ketchup",
      category: "sauces_condiments",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 15,
      ingredientsText: "Water, Tomato Paste (26%), Sugar, Salt, Acidity Regulator (260), Thickeners (1422, 415), Onion Powder, Garlic Powder, Preservative (211)",
      nutrition: {
        caloriesKcal: 129,
        totalFatG: 0.2,
        saturatedFatG: 0.1,
        transFatG: 0,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 30.6,
        sugarsG: 27.5,
        addedSugarsG: 23,
        proteinG: 1.2,
        fiberG: 1.1,
        sodiumMg: 890,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
  "7622201726058": {
    barcode: "7622201726058",
    data: {
      productName: "Cadbury Oreo Original Vanilla Creme Biscuits",
      category: "biscuits",
      productForm: "solid",
      nutritionBasis: "per_100g",
      servingSize: 46,
      ingredientsText: "Refined Wheat Flour, Sugar, Edible Vegetable Fat (Palm Oil), Cocoa Solids (4.5%), Invert Sugar, Leavening Agents (500(ii), 503(ii)), Salt, Emulsifier (322)",
      nutrition: {
        caloriesKcal: 483,
        totalFatG: 19.6,
        saturatedFatG: 9.3,
        transFatG: 0.1,
        monounsaturatedFatG: null,
        polyunsaturatedFatG: null,
        carbohydratesG: 71.5,
        sugarsG: 38.5,
        addedSugarsG: 37,
        proteinG: 5.1,
        fiberG: 2.2,
        sodiumMg: 420,
      },
    },
    source: "curated_seed",
    cachedAt: "2026-10-24T00:00:00.000Z",
  },
};

// In-memory lookup map for 0ms lookup latency
const memoryCache = new Map<string, CachedProductRecord>();
let isInitialized = false;

function initializeCache() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      let raw = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      // Strip UTF-8 BOM if present
      raw = raw.replace(/^\uFEFF/, "").trim();
      if (raw) {
        const parsed: CacheStore = JSON.parse(raw);
        if (parsed && typeof parsed.products === "object") {
          for (const [barcode, record] of Object.entries(parsed.products)) {
            memoryCache.set(barcode.trim(), record);
          }
        }
      }
    }
  } catch (error) {
    console.warn("Failed to read products.cache.json, starting with fresh cache:", error);
  }

  // Ensure default curated staples are always seeded in the cache
  for (const [barcode, record] of Object.entries(DEFAULT_INDIAN_STAPLES)) {
    if (!memoryCache.has(barcode)) {
      memoryCache.set(barcode, record);
    }
  }
}

export function getCachedProductByBarcode(barcode: string): ProductAnalysisInput | null {
  initializeCache();
  const normalized = barcode.trim();
  const record = memoryCache.get(normalized);
  return record ? record.data : null;
}

export function cacheProduct(
  barcode: string,
  data: ProductAnalysisInput,
  source: "open_food_facts" | "user_scan" | "curated_seed" = "open_food_facts",
): void {
  initializeCache();
  const normalized = barcode.trim();
  if (!normalized || !/^\d{8,14}$/.test(normalized)) {
    return;
  }

  const record: CachedProductRecord = {
    barcode: normalized,
    data,
    source,
    cachedAt: new Date().toISOString(),
  };

  memoryCache.set(normalized, record);

  // Asynchronously flush to disk (non-blocking)
  saveCacheToDisk().catch((err) => {
    console.error("Failed to write product cache to disk:", err);
  });
}

export async function saveCacheToDisk(): Promise<void> {
  const productsObj: Record<string, CachedProductRecord> = {};
  for (const [key, val] of memoryCache.entries()) {
    productsObj[key] = val;
  }

  const store: CacheStore = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    totalCached: memoryCache.size,
    products: productsObj,
  };

  const dir = path.dirname(CACHE_FILE_PATH);
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  await fs.promises.writeFile(
    CACHE_FILE_PATH,
    JSON.stringify(store, null, 2),
    "utf-8",
  );
}

export function getCacheStats() {
  initializeCache();
  return {
    totalCached: memoryCache.size,
  };
}
