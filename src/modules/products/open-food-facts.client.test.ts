import { describe, expect, it, vi } from "vitest";
import {
  getProductByBarcode,
  searchProductsByName,
} from "./open-food-facts.client";

function createFetcher(payload: unknown, ok = true) {
  return vi.fn<typeof fetch>().mockResolvedValue({
    ok,
    status: ok ? 200 : 503,
    json: async () => payload,
  } as Response);
}

describe("Open Food Facts client", () => {
  it("fetches a product by barcode", async () => {
    const fetcher = createFetcher({
      status: 1,
      product: {
        code: "8901234567890",
        product_name: "Example Biscuits",
        brands: "Example Brand",
      },
    });

    const product = await getProductByBarcode("8901234567890", fetcher);

    expect(product?.product_name).toBe("Example Biscuits");
    expect(fetcher).toHaveBeenCalledOnce();
    expect(String(fetcher.mock.calls[0][0])).toContain(
      "/api/v2/product/8901234567890.json",
    );
  });

  it("returns null when a barcode is not found", async () => {
    const fetcher = createFetcher({ status: 0 });

    await expect(
      getProductByBarcode("8901234567890", fetcher),
    ).resolves.toBeNull();
  });

  it("rejects an invalid barcode without making a request", async () => {
    const fetcher = createFetcher({ status: 0 });

    await expect(getProductByBarcode("abc", fetcher)).rejects.toThrow(
      "Barcode must contain 8 to 14 digits.",
    );

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("searches products by name", async () => {
    const fetcher = createFetcher({
      products: [
        {
          code: "8901234567890",
          product_name: "Parle-G",
          brands: "Parle",
        },
      ],
    });

    const products = await searchProductsByName("Parle-G", fetcher);

    expect(products).toHaveLength(1);
    expect(products[0].product_name).toBe("Parle-G");

    const requestedUrl = String(fetcher.mock.calls[0][0]);
    expect(requestedUrl).toContain("/cgi/search.pl?");
    expect(requestedUrl).toContain("search_terms=Parle-G");
  });

  it("returns an empty list for a blank search", async () => {
    const fetcher = createFetcher({ products: [] });

    await expect(searchProductsByName("   ", fetcher)).resolves.toEqual([]);

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("throws when the API returns an HTTP error", async () => {
    const fetcher = createFetcher({}, false);

    await expect(searchProductsByName("Parle-G", fetcher)).rejects.toThrow(
      "Open Food Facts request failed with status 503.",
    );
  });
});
