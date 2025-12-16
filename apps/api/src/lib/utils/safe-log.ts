import { env } from "cloudflare:workers";

/**
 * Safely logs an error, preventing sensitive information leakage in production.
 * In local development, logs the full error object.
 * In production/dev environments, logs only the error message.
 */
export function safeLogError(context: string, error: unknown): void {
  if (env.MODE === "local") {
    console.error(`${context}:`, error);
  } else {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`${context}:`, message);
  }
}
