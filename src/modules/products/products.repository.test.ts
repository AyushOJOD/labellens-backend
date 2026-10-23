import { describe, expect, it } from "vitest";
import {
  getAllProducts,
  findProducts,
  findProductById,
} from "./products.repository";

describe("products.repository", () => {
  it("loads the product catalog", () => {
    expect(getAllProducts().length).toBeGreaterThanOrEqual(50);
  });

  it("finds products by brand", () => {
    const results = findProducts("parle");

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((product) => product.brand.toLowerCase().includes("parle")),
    ).toBe(true);
  });

  it("finds products by name", () => {
    const results = findProducts("bhujia");

    expect(results.length).toBeGreaterThan(0);
  });

  it("returns no results for an unknown product", () => {
    expect(findProducts("unknown-product-xyz")).toEqual([]);
  });

  it("returns no results for an empty query", () => {
    expect(findProducts("   ")).toEqual([]);
  });

  it("finds a product by ID", () => {
    const product = getAllProducts()[0];

    expect(findProductById(product.id)).toEqual(product);
  });

  it("returns undefined for an unknown ID", () => {
    expect(findProductById("nonexistent-id")).toBeUndefined();
  });

  it("preserves missing nutrients as null", () => {
    const results = getAllProducts();

    for (const product of results) {
      for (const value of Object.values(product.nutrition)) {
        if (value === null) {
          expect(value).toBeNull();
        }
      }
    }
  });

  it("includes all three cooking oil products", () => {
    const products = getAllProducts();

    expect(
      products.some(
        (product) => product.id === "fortune-kachi-ghani-mustard-oil",
      ),
    ).toBe(true);

    expect(
      products.some(
        (product) => product.id === "figaro-extra-virgin-olive-oil",
      ),
    ).toBe(true);

    expect(
      products.some(
        (product) => product.id === "fortune-refined-sunflower-oil",
      ),
    ).toBe(true);
  });

  it.each([
    ["mustard oil", "mustard_oil"],
    ["olive oil", "olive_oil"],
    ["sunflower oil", "sunflower_oil"],
  ])("finds %s with the correct category", (query, category) => {
    const results = findProducts(query);

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((product) => product.category === category)).toBe(true);
  });

  it("keeps cooking oil seed records marked as identity-only", () => {
    const oilIds = [
      "fortune-kachi-ghani-mustard-oil",
      "figaro-extra-virgin-olive-oil",
      "fortune-refined-sunflower-oil",
    ];

    for (const id of oilIds) {
      const product = findProductById(id);

      expect(product).toBeDefined();
      expect(product?.dataStatus).toBe("identity_only");
      expect(product?.nutritionBasis).toBeNull();
    }
  });
});
