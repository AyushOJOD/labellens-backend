const BASE_URL = "https://world.openfoodfacts.org";

const USER_AGENT = "LabelLens/0.1";

const PRODUCT_FIELDS = [
  "code",
  "product_name",
  "brands",
  "categories_tags_en",
  "quantity",
  "product_quantity",
  "product_quantity_unit",
  "nutriments",
  "ingredients_text",
  "ingredients_text_en",
];

export interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  categories_tags_en?: string[];
  quantity?: string;
  product_quantity?: number | string;
  product_quantity_unit?: string;
  nutriments?: Record<string, unknown>;
  ingredients_text?: string;
  ingredients_text_en?: string;
}

interface BarcodeResponse {
  status?: number;
  product?: OpenFoodFactsProduct;
}

interface SearchResponse {
  products?: OpenFoodFactsProduct[];
}

async function fetchJson<T>(url: string, fetcher: typeof fetch): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetcher(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Open Food Facts request failed with status ${response.status}.`,
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.warn("Open Food Facts request timed out after 6 seconds.");
      return null;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getProductByBarcode(
  barcode: string,
  fetcher: typeof fetch = fetch,
): Promise<OpenFoodFactsProduct | null> {
  const normalizedBarcode = barcode.trim();

  if (!/^\d{8,14}$/.test(normalizedBarcode)) {
    throw new Error("Barcode must contain 8 to 14 digits.");
  }

  const fields = PRODUCT_FIELDS.join(",");
  const url =
    `${BASE_URL}/api/v2/product/` +
    `${encodeURIComponent(normalizedBarcode)}.json?fields=${fields}`;

  try {
    const result = await fetchJson<BarcodeResponse>(url, fetcher);

    if (!result || result.status !== 1 || !result.product) {
      return null;
    }

    return result.product;
  } catch (err: any) {
    if (err?.message?.includes("404") || err?.name === "AbortError") {
      return null;
    }
    throw err;
  }
}

export async function searchProductsByName(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<OpenFoodFactsProduct[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const params = new URLSearchParams({
    search_terms: normalizedQuery,
    search_simple: "1",
    action: "process",
    json: "1",
    page: "1",
    page_size: "10",
    fields: PRODUCT_FIELDS.join(","),
  });

  const url = `${BASE_URL}/cgi/search.pl?${params.toString()}`;
  const result = await fetchJson<SearchResponse>(url, fetcher);

  return result && Array.isArray(result.products) ? result.products : [];
}
