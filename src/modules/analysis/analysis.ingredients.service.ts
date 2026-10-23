import type { IngredientAdditive, IngredientsAnalysis } from "./analysis.types";

interface AdditiveDefinition {
  code: string;
  name: string;
  category: "sweetener" | "color" | "flavor_enhancer" | "preservative" | "emulsifier" | "other";
  description: string;
  keywords: string[];
}

const ADDITIVES_DATABASE: AdditiveDefinition[] = [
  // Artificial Sweeteners
  {
    code: "INS 955",
    name: "Sucralose",
    category: "sweetener",
    description: "Intense non-nutritive artificial sweetener (600x sweeter than sugar).",
    keywords: ["955", "sucralose"],
  },
  {
    code: "INS 950",
    name: "Acesulfame Potassium (Ace-K)",
    category: "sweetener",
    description: "Synthetic calorie-free artificial sweetener often blended with other sweeteners.",
    keywords: ["950", "acesulfame"],
  },
  {
    code: "INS 951",
    name: "Aspartame",
    category: "sweetener",
    description: "Artificial non-saccharide sweetener commonly used in diet beverages.",
    keywords: ["951", "aspartame"],
  },
  {
    code: "INS 954",
    name: "Saccharin",
    category: "sweetener",
    description: "Oldest synthetic non-nutritive sweetener.",
    keywords: ["954", "saccharin"],
  },
  {
    code: "INS 960",
    name: "Steviol Glycosides (Stevia)",
    category: "sweetener",
    description: "Natural high-intensity sweetener extracted from Stevia plant leaves.",
    keywords: ["960", "stevia", "steviol"],
  },
  {
    code: "INS 961",
    name: "Neotame",
    category: "sweetener",
    description: "Ultra-potent artificial sweetener (7,000-13,000x sweeter than sugar).",
    keywords: ["961", "neotame"],
  },

  // Synthetic Food Colors
  {
    code: "INS 102",
    name: "Tartrazine (Yellow 5)",
    category: "color",
    description: "Synthetic lemon-yellow azo dye; subject to strict labeling regulations in India.",
    keywords: ["102", "tartrazine"],
  },
  {
    code: "INS 110",
    name: "Sunset Yellow FCF (Yellow 6)",
    category: "color",
    description: "Synthetic petroleum-derived orange-yellow food coloring.",
    keywords: ["110", "sunset yellow"],
  },
  {
    code: "INS 122",
    name: "Carmoisine (Azorubine)",
    category: "color",
    description: "Synthetic red food dye commonly added to Indian sweets, jams, and syrups.",
    keywords: ["122", "carmoisine", "azorubine"],
  },
  {
    code: "INS 124",
    name: "Ponceau 4R (Cochineal Red A)",
    category: "color",
    description: "Synthetic strawberry-red food color.",
    keywords: ["124", "ponceau"],
  },
  {
    code: "INS 127",
    name: "Erythrosine",
    category: "color",
    description: "Synthetic cherry-pink food coloring.",
    keywords: ["127", "erythrosine"],
  },
  {
    code: "INS 133",
    name: "Brilliant Blue FCF",
    category: "color",
    description: "Synthetic blue food coloring.",
    keywords: ["133", "brilliant blue"],
  },
  {
    code: "INS 150d",
    name: "Caramel IV (Sulphite Ammonia Caramel)",
    category: "color",
    description: "Artificial dark brown color widely used in colas, gravies, and packaged bread.",
    keywords: ["150d", "caramel iv", "caramel color iv"],
  },

  // Flavor Enhancers
  {
    code: "INS 621",
    name: "Monosodium Glutamate (MSG)",
    category: "flavor_enhancer",
    description: "Umami flavor enhancer commonly found in noodles, chips, and spice mixes.",
    keywords: ["621", "msg", "monosodium glutamate"],
  },
  {
    code: "INS 627",
    name: "Disodium Guanylate",
    category: "flavor_enhancer",
    description: "Synergistic flavor enhancer typically paired with MSG in savory snacks.",
    keywords: ["627", "disodium guanylate"],
  },
  {
    code: "INS 631",
    name: "Disodium Inosinate",
    category: "flavor_enhancer",
    description: "Savory nucleotide flavor enhancer used in seasoned snack foods.",
    keywords: ["631", "disodium inosinate"],
  },
  {
    code: "INS 635",
    name: "Disodium 5'-ribonucleotides",
    category: "flavor_enhancer",
    description: "Commercial blend of inosinate and guanylate for intense savory taste.",
    keywords: ["635", "ribonucleotides"],
  },

  // Preservatives
  {
    code: "INS 211",
    name: "Sodium Benzoate",
    category: "preservative",
    description: "Common chemical preservative in acidic foods, carbonated drinks, and sauces.",
    keywords: ["211", "sodium benzoate"],
  },
  {
    code: "INS 202",
    name: "Potassium Sorbate",
    category: "preservative",
    description: "Antimicrobial preservative preventing mold and yeast growth in packaged foods.",
    keywords: ["202", "potassium sorbate"],
  },
  {
    code: "INS 282",
    name: "Calcium Propionate",
    category: "preservative",
    description: "Common preservative used to extend the shelf-life of packaged bread and rusks.",
    keywords: ["282", "calcium propionate"],
  },

  // Emulsifiers & Thickeners
  {
    code: "INS 407",
    name: "Carrageenan",
    category: "emulsifier",
    description: "Seaweed-derived gelling and thickening agent; may cause digestive sensitivity in some individuals.",
    keywords: ["407", "carrageenan"],
  },
  {
    code: "INS 322",
    name: "Lecithin",
    category: "emulsifier",
    description: "Natural emulsifier typically sourced from soya or sunflower.",
    keywords: ["322", "lecithin"],
  },
  {
    code: "INS 412",
    name: "Guar Gum",
    category: "emulsifier",
    description: "Natural plant seed thickener used in sauces, ice creams, and dairy.",
    keywords: ["412", "guar gum"],
  },
  {
    code: "INS 415",
    name: "Xanthan Gum",
    category: "emulsifier",
    description: "Fermented microbial polysaccharide used as a stabilizer and thickener.",
    keywords: ["415", "xanthan gum"],
  },
  {
    code: "INS 471",
    name: "Mono- and Diglycerides of Fatty Acids",
    category: "emulsifier",
    description: "Commercial emulsifier derived from plant or animal fats used in baked goods.",
    keywords: ["471", "mono and diglycerides", "mono- and diglycerides"],
  },
];

const HIDDEN_SUGAR_PATTERNS = [
  { term: "Maltodextrin", regex: /\bmaltodextrin\b/i },
  { term: "Invert Sugar Syrup", regex: /\binvert\s*(sugar|syrup)\b/i },
  { term: "Liquid Glucose", regex: /\b(liquid\s*glucose|glucose\s*syrup)\b/i },
  { term: "High Fructose Corn Syrup", regex: /\b(high\s*fructose|hfcs)\b/i },
  { term: "Corn Syrup", regex: /\bcorn\s*syrup\b/i },
  { term: "Dextrose", regex: /\bdextrose\b/i },
  { term: "Malt Extract / Maltose", regex: /\b(malt\s*extract|maltose)\b/i },
  { term: "Caramelized Sugar", regex: /\bcaramel(ized)?\s*sugar\b/i },
  { term: "Cane Juice Crystals", regex: /\bcane\s*juice\b/i },
];

const PALM_OIL_REGEX =
  /\b(palmolein|palm\s*oil|fractionated\s*palm|palm\s*kernel|vegetable\s*fat\s*\(palm\)|hydrogenated\s*vegetable\s*(oil|fat)|vanaspati)\b/i;

const ALLERGEN_PATTERNS = [
  { name: "Gluten / Wheat", regex: /\b(wheat|maida|atta|gluten|semolina|suji|barley|rye)\b/i },
  { name: "Milk / Dairy", regex: /\b(milk|dairy|whey|casein|butter|cheese|curd|dahi|lactose|milk\s*solids)\b/i },
  { name: "Soy", regex: /\b(soy|soya|soybean)\b/i },
  { name: "Peanuts", regex: /\b(peanut|peanuts|groundnut|groundnuts)\b/i },
  { name: "Tree Nuts", regex: /\b(almond|almonds|cashew|cashews|walnut|walnuts|pistachio|pistachios|hazelnut)\b/i },
  { name: "Sesame", regex: /\b(sesame|til)\b/i },
  { name: "Mustard", regex: /\b(mustard|sarson)\b/i },
  { name: "Sulphites", regex: /\b(sulphite|sulfite|sulphur\s*dioxide)\b/i },
];

export function analyzeIngredients(
  rawText: string | null | undefined,
): IngredientsAnalysis {
  if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
    return {
      rawIngredientsText: null,
      hasPalmOil: false,
      hiddenSugars: [],
      additives: [],
      allergens: [],
      summary: "Ingredient list not provided or not legible on scan.",
    };
  }

  const cleanText = rawText.trim();
  const lower = cleanText.toLowerCase();

  // 1. Palm Oil Detection
  const palmMatch = cleanText.match(PALM_OIL_REGEX);
  const hasPalmOil = Boolean(palmMatch);
  const palmOilType = palmMatch
    ? palmMatch[0].charAt(0).toUpperCase() + palmMatch[0].slice(1).toLowerCase()
    : undefined;

  // 2. Hidden Sugars Detection
  const hiddenSugars: string[] = [];
  for (const item of HIDDEN_SUGAR_PATTERNS) {
    if (item.regex.test(lower)) {
      hiddenSugars.push(item.term);
    }
  }

  // 3. Additive / INS Detection
  const matchedAdditives: IngredientAdditive[] = [];
  const addedCodes = new Set<string>();

  for (const def of ADDITIVES_DATABASE) {
    const isMatched = def.keywords.some((kw) => {
      // Check for standalone word or INS/E prefix
      const pattern = new RegExp(`\\b(ins\\s*|e-?\\s*)?${kw}\\b`, "i");
      return pattern.test(lower);
    });

    if (isMatched && !addedCodes.has(def.code)) {
      addedCodes.add(def.code);
      matchedAdditives.push({
        code: def.code,
        name: def.name,
        category: def.category,
        description: def.description,
      });
    }
  }

  // 4. Allergen Detection
  const allergens: string[] = [];
  for (const allergen of ALLERGEN_PATTERNS) {
    if (allergen.regex.test(lower)) {
      allergens.push(allergen.name);
    }
  }

  // Summary Construction
  const summaryParts: string[] = [];
  if (hasPalmOil) {
    summaryParts.push(`Contains ${palmOilType || "Palm Oil"}`);
  }
  if (hiddenSugars.length > 0) {
    summaryParts.push(`${hiddenSugars.length} hidden sugar source(s) (${hiddenSugars.join(", ")})`);
  }
  if (matchedAdditives.length > 0) {
    summaryParts.push(`${matchedAdditives.length} chemical additive(s) identified`);
  }
  if (allergens.length > 0) {
    summaryParts.push(`Allergens: ${allergens.join(", ")}`);
  }

  const summary =
    summaryParts.length > 0
      ? summaryParts.join(" • ")
      : "No palm oil, hidden sugars, or notable chemical additives flagged.";

  return {
    rawIngredientsText: cleanText,
    hasPalmOil,
    palmOilType,
    hiddenSugars,
    additives: matchedAdditives,
    allergens,
    summary,
  };
}
