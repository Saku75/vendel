type TokenMetadata = {
  issuer?: string;
  audience?: string;
  purpose?: string;

  issuedAt: number;
  expiresAt: number;

  nonce: string;
};

export type { TokenMetadata };
