type ApiItem<T, K extends keyof T = never> = Pick<
  T,
  Exclude<keyof T, "id" | "createdAt" | "updatedAt" | K>
>;

export { ApiItem };
