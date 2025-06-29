type TokenPayloadData =
  | string
  | number
  | boolean
  | null
  | undefined
  | TokenPayloadData[]
  | { [key: string | number]: TokenPayloadData };

type TokenPayload<T extends TokenPayloadData = null> = {
  issuer?: string;
  purpose?: string;

  issuedAt: number;
  expiresAt: number;

  data: T;
};

export type { TokenPayload, TokenPayloadData };
