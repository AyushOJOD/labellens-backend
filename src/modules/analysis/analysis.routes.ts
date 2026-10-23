import { Router } from "express";
import { analyzeProduct } from "./analysis.controller";
import upload, {
  validateImageContents,
  allowedMimeTypes,
} from "./analysis.upload";
import { handleUploadError } from "./analysis.upload.middleware";
import { extractNutritionFromImage } from "./analysis.vision.service";
import { evaluateNutrition } from "./analysis.service";
import { cacheProduct } from "../products/products.cache";

const router = Router();

router.post("/", analyzeProduct);

router.post(
  "/image",
  (req, res, next) => {
    upload.single("image")(req, res, (err: unknown) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }

      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image using the 'image' field.",
        });
      }

      const isValidImage = await validateImageContents(
        req.file.buffer,
        req.file.mimetype,
      );

      if (!isValidImage) {
        return res.status(400).json({
          success: false,
          message: "The uploaded file is not a valid JPEG, PNG, or WebP image.",
        });
      }

      const { fileTypeFromBuffer } = await import("file-type");
      const detectedType = await fileTypeFromBuffer(req.file.buffer);

      if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
        return res.status(400).json({
          success: false,
          message: "The uploaded file is not a valid JPEG, PNG, or WebP image.",
        });
      }

      req.file.mimetype = detectedType.mime;

      if (!isValidImage) {
        return res.status(400).json({
          success: false,
          message: "The uploaded file is not a valid JPEG, PNG, or WebP image.",
        });
      }

      const extracted = await extractNutritionFromImage(req.file);

      // Auto-cache to local database if barcode was provided by client or extracted from packaging
      const submittedBarcode =
        (typeof req.body?.barcode === "string" && req.body.barcode.trim()) ||
        extracted.barcode ||
        null;

      let isCached = false;
      if (submittedBarcode && /^\d{8,14}$/.test(submittedBarcode)) {
        cacheProduct(submittedBarcode, extracted, "user_scan");
        isCached = true;
      }

      const evaluation = evaluateNutrition(extracted);

      return res.status(200).json({
        success: true,
        data: extracted,
        evaluation,
        cached: isCached,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
