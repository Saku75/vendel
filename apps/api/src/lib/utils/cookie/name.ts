function cookieName(
  name: string,
  options?: { prefix?: string; suffix?: string },
): string {
  const fullName: string[] = [];

  if (options?.prefix) fullName.push(options.prefix);
  fullName.push(name);
  if (options?.suffix) fullName.push(options.suffix);

  return fullName.join("-");
}

export { cookieName };
