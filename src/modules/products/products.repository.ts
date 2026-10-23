export interface ProductRecord {
  id: string;
  name: string;
  brand: string;
  category: string;
  productForm: "solid" | "liquid";
  nutritionBasis: "per_100g" | "per_100ml" | null;
  servingSize: number | null;
  nutrition: {
    caloriesKcal: number | null;
    totalFatG: number | null;
    saturatedFatG: number | null;
    transFatG: number | null;
    monounsaturatedFatG: number | null;
    polyunsaturatedFatG: number | null;
    carbohydratesG: number | null;
    sugarsG: number | null;
    addedSugarsG: number | null;
    proteinG: number | null;
    fiberG: number | null;
    sodiumMg: number | null;
  };
  dataStatus: string;
  source: {
    name: string;
    url: string;
    accessedOn: string;
  };
  notes: string | null;
}

interface ProductSeedFile {
  products: ProductRecord[];
}

const catalog = require("./products.seed.json") as ProductSeedFile;

export function getAllProducts(): ProductRecord[] {
  return catalog.products;
}

export function findProducts(query: string): ProductRecord[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return catalog.products.filter((product) => {
    const searchableText =
      `${product.name} ${product.brand} ${product.category}`.toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function findProductById(id: string): ProductRecord | undefined {
  return catalog.products.find((product) => product.id === id);
}
