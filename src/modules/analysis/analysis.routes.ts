
import { Router } from "express";
import { analyzeProduct } from "./analysis.controller";
import upload from "./analysis.upload";
import { handleUploadError } from "./analysis.upload.middleware";
import { extractNutritionFromImage } from "./analysis.vision.service";
import { evaluateNutrition } from "./analysis.service";

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

      const extracted = await extractNutritionFromImage(req.file);

      const evaluation = evaluateNutrition(extracted);

      return res.status(200).json({
        success: true,
        data: extracted,
        evaluation,
      });
    } catch (error) {
      next(error);
    }
  },
);


export default router;
