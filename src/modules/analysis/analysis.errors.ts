
export type AnalysisErrorCode =
  | "AI_UNAVAILABLE"
  | "INVALID_AI_RESPONSE";

export class AnalysisError extends Error {
  constructor(
    public readonly code: AnalysisErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}
