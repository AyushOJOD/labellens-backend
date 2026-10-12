
import type { Request, Response, NextFunction } from "express";
import multer from "multer";

export function handleUploadError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Image must be 5 MB or smaller.",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Please upload only one image.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid image upload.",
    });
  }

  if (err instanceof Error && err.message ===
      "Only JPEG, PNG, and WebP images are allowed.") {
    return res.status(415).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
}
