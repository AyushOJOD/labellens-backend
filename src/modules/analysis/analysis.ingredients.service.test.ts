import { describe, it, expect } from "vitest";
import { analyzeIngredients } from "./analysis.ingredients.service";

describe("analyzeIngredients", () => {
  it("handles null or empty ingredient strings safely", () => {
    const result = analyzeIngredients(null);
    expect(result.hasPalmOil).toBe(false);
    expect(result.hiddenSugars).toEqual([]);
    expect(result.additives).toEqual([]);
    expect(result.allergens).toEqual([]);
  });

  it("detects palmolein and palm oil in commercial snack ingredients", () => {
    const text =
      "Refined Wheat Flour (Maida), Refined Palmolein Oil, Sugar, Invert Sugar Syrup, Raising Agents (INS 500(ii)), Iodised Salt.";
    const result = analyzeIngredients(text);

    expect(result.hasPalmOil).toBe(true);
    expect(result.palmOilType).toMatch(/palmolein/i);
    expect(result.hiddenSugars).toContain("Invert Sugar Syrup");
    expect(result.allergens).toContain("Gluten / Wheat");
  });

  it("detects hidden sugars like maltodextrin and liquid glucose", () => {
    const text =
      "Dehydrated Potato Flakes, Maltodextrin, Liquid Glucose, Salt, Spices.";
    const result = analyzeIngredients(text);

    expect(result.hiddenSugars).toContain("Maltodextrin");
    expect(result.hiddenSugars).toContain("Liquid Glucose");
  });

  it("detects artificial sweeteners and INS additives", () => {
    const text =
      "Carbonated Water, Acidity Regulators (INS 330), Sweeteners (INS 950, INS 955), Preservative (INS 211), Food Color (INS 150d).";
    const result = analyzeIngredients(text);

    const codes = result.additives.map((a) => a.code);
    expect(codes).toContain("INS 950");
    expect(codes).toContain("INS 955");
    expect(codes).toContain("INS 211");
    expect(codes).toContain("INS 150d");

    const sucralose = result.additives.find((a) => a.code === "INS 955");
    expect(sucralose?.category).toBe("sweetener");
    expect(sucralose?.name).toBe("Sucralose");
  });

  it("detects synthetic dyes like Tartrazine (INS 102) and Sunset Yellow", () => {
    const text =
      "Corn meal, refined palm oil, spices, permitted synthetic colors (INS 102, INS 110), flavor enhancer (INS 621).";
    const result = analyzeIngredients(text);

    expect(result.hasPalmOil).toBe(true);
    const codes = result.additives.map((a) => a.code);
    expect(codes).toContain("INS 102");
    expect(codes).toContain("INS 110");
    expect(codes).toContain("INS 621");
  });

  it("identifies common food allergens", () => {
    const text =
      "Whole wheat flour, milk solids, soya lecithin (INS 322), roasted peanuts.";
    const result = analyzeIngredients(text);

    expect(result.allergens).toContain("Gluten / Wheat");
    expect(result.allergens).toContain("Milk / Dairy");
    expect(result.allergens).toContain("Soy");
    expect(result.allergens).toContain("Peanuts");
  });
});
