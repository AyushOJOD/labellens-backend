
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import analysisRoutes from "./modules/analysis/analysis.routes";
import { AnalysisError } from "./modules/analysis/analysis.errors";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  (
    err: unknown,
    _req: import("express").Request,
    res: import("express").Response,
    _next: import("express").NextFunction,
  ) => {
    if (err instanceof AnalysisError) {
  const status = err.code === "AI_UNAVAILABLE" ? 503 : 502;

  return res.status(status).json({
    success: false,
    code: err.code,
    message:
      err.code === "AI_UNAVAILABLE"
        ? "Nutrition analysis is temporarily unavailable. Please try again later."
        : "We couldn't reliably read the nutrition label. Please try a clearer image.",
  });
}

    console.error("Request failed:", err);

  },
);


app.use("/api/health", healthRoutes);
app.use("/api/analyze", analysisRoutes);

export default app;
