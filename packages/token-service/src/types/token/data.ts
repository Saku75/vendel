type TokenData =
  | string
  | number
  | boolean
  | null
  | undefined
  | TokenData[]
  | { [key: string | number]: TokenData };

export type { TokenData };
