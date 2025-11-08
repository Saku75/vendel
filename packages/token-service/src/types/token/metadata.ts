type TokenMetadata = {
  id: string;

  issuer: string;
  audience: string;
  purpose?: string;

  issuedAt: number;
  expiresAt: number;

  nonce: string;
};

export type { TokenMetadata };
