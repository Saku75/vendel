/**
 * Converts a TypeScript string enum to the tuple format Drizzle expects.
 * This avoids having to manually list all enum values in the schema.
 *
 * @example
 * enum AuthRole { Admin = "admin", User = "user" }
 * text({ enum: enumValues(AuthRole) })
 */
function enumValues<T extends Record<string, string>>(
  myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum) as [T[keyof T], ...T[keyof T][]];
}

export { enumValues };
