import ky from "ky";

class Captcha {
  private readonly key: string;
  private readonly remoteIp?: string;

  constructor(key: string, remoteIp?: string) {
    this.key = key;
    this.remoteIp = remoteIp;
  }

  public async verify(token: string, idempotencyKey?: string) {
    const result = await ky.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        json: {
          secret: this.key,
          response: token,
          remoteip: this.remoteIp,
          idempotency_key: idempotencyKey,
        },
      },
    );

    const data = (await result.json()) as { success: boolean };

    return data.success;
  }

  public createIdempotencyKey() {
    return crypto.randomUUID();
  }
}

export { Captcha };
