import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes";
import analysisRoutes from "./modules/analysis/analysis.routes";
import { AnalysisError } from "./modules/analysis/analysis.errors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/analyze", analysisRoutes);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof AnalysisError) {
      const isUnavailable = err.code === "AI_UNAVAILABLE";

      return res.status(isUnavailable ? 503 : 502).json({
        success: false,
        code: err.code,
        message: isUnavailable
          ? "Nutrition analysis is temporarily unavailable. Please try again later."
          : "We couldn't reliably read the nutrition label. Please try a clearer image.",
      });
    }

    console.error("Request failed:", err);

    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      err.status === 429
        ? 503
        : 500;

    return res.status(status).json({
      success: false,
      message:
        status === 503
          ? "Nutrition analysis is temporarily unavailable. Please try again later."
          : "Unable to process the request right now.",
    });
  },
);

export default app;
