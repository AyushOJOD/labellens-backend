import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import type { ProductAnalysisInput } from "./analysis.types";

vi.mock("./analysis.vision.service", () => ({
  extractNutritionFromImage: vi.fn(),
}));

vi.mock("./analysis.service", () => ({
  evaluateNutrition: vi.fn(() => ({
    profile: "biscuits-development-v1",
    status: "complete",
    headline: "High in sugar",
    findings: [],
  })),
}));

import { extractNutritionFromImage } from "./analysis.vision.service";

const mockedExtract = vi.mocked(extractNutritionFromImage);

const extractedProduct: ProductAnalysisInput = {
  productName: "Chocolate Biscuits",
  category: "biscuits",
  productForm: "solid",
  nutritionBasis: "per_100g",
  servingSize: null,
  nutrition: {
    caloriesKcal: 450,
    totalFatG: 18,
    saturatedFatG: 5,
    carbohydratesG: 65,
    sugarsG: 25,
    addedSugarsG: 20,
    proteinG: 6,
    fiberG: 2,
    sodiumMg: 300,
  },
};

// A small JPEG fixture for testing the upload signature.
const validJpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AI//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AI//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AI//2Q==",
  "base64",
);

describe("POST /api/analyze/image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedExtract.mockResolvedValue(extractedProduct);
  });

  it("returns 400 when no image is uploaded", async () => {
    const response = await request(app).post("/api/analyze/image").expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("upload an image");
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("rejects unsupported MIME types", async () => {
    const response = await request(app)
      .post("/api/analyze/image")
      .attach("image", Buffer.from("plain text"), {
        filename: "notes.txt",
        contentType: "text/plain",
      })
      .expect(415);

    expect(response.body.success).toBe(false);
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("rejects fake image content declared as JPEG", async () => {
    const response = await request(app)
      .post("/api/analyze/image")
      .attach("image", Buffer.from("not a real image"), {
        filename: "fake.jpg",
        contentType: "image/jpeg",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("not a valid");
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("processes a valid JPEG upload", async () => {
    const response = await request(app)
      .post("/api/analyze/image")
      .attach("image", validJpeg, {
        filename: "label.jpg",
        contentType: "image/jpeg",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(extractedProduct);
    expect(response.body.evaluation.status).toBe("complete");
    expect(mockedExtract).toHaveBeenCalledTimes(1);
  });

  it("rejects files larger than 5 MB", async () => {
    const oversizedImage = Buffer.alloc(5 * 1024 * 1024 + 1, 0);

    const response = await request(app)
      .post("/api/analyze/image")
      .attach("image", oversizedImage, {
        filename: "large.jpg",
        contentType: "image/jpeg",
      })
      .expect(413);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("5 MB");
    expect(mockedExtract).not.toHaveBeenCalled();
  });
});
