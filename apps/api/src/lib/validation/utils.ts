import { ZodError } from "zod";

function extractIssues(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.errors) {
    const path = issue.path.join(".");
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}

export { extractIssues };
