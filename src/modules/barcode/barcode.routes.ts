import { Router, Request, Response } from "express";
import { lookupBarcodeAndAnalyze } from "./barcode.service";

const router = Router();

router.get("/:barcode", async (req: Request, res: Response) => {
  try {
    const rawBarcode = req.params.barcode;
    const barcode = (Array.isArray(rawBarcode) ? rawBarcode[0] : rawBarcode) || "";

    if (!barcode || !/^\d{8,14}$/.test(barcode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 8-14 digit barcode.",
      });
    }

    const result = await lookupBarcodeAndAnalyze(barcode.trim());
    const status = result.success ? 200 : 404;
    return res.status(status).json(result);
  } catch (error) {
    console.error("Barcode lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during barcode lookup.",
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { barcode } = req.body;
    if (!barcode || typeof barcode !== "string" || !/^\d{8,14}$/.test(barcode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 8-14 digit barcode in the request body.",
      });
    }

    const result = await lookupBarcodeAndAnalyze(barcode.trim());
    const status = result.success ? 200 : 404;
    return res.status(status).json(result);
  } catch (error) {
    console.error("Barcode lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during barcode lookup.",
    });
  }
});

export default router;
