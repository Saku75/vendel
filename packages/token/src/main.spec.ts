import { randomBytes } from "@noble/hashes/utils";
import { expect, it } from "vitest";

import { TokenExpiry } from "./enums/expiry";
import { Token } from "./main";
import { TokenPayloadData } from "./types/payload";

const tokens = new Token({
  encryption: randomBytes(32),
  signing: randomBytes(32),
});

it("should return valid and non-expired token by default", () => {
  const token = tokens.create(null);

  expect(/^v\d(\.[A-Za-z0-9_-]+){3}$/.test(token)).toBe(true);

  const currentTime = Date.now();
  const { valid, expired, payload } = tokens.read(token);

  expect(valid).toBe(true);
  expect(expired).toBe(false);
  expect(Math.abs(payload.issuedAt - currentTime) < 1000).toBe(true);
  expect(
    Math.abs(payload.expiresAt - (currentTime + TokenExpiry.OneHour * 1000)) <
      1000,
  ).toBe(true);
});

it("should return token data unmodified", () => {
  const payloadData: TokenPayloadData = { hello: "world!" };

  const token = tokens.create(payloadData);
  const { payload } = tokens.read(token);

  expect(payload.data).toEqual(payloadData);
});

it("should generate new nonce for every token", () => {
  const token1 = tokens.create(null).split(".");
  const token2 = tokens.create(null).split(".");

  expect(token1[1]).not.toBe(token2[1]);
  expect(token1[2]).not.toBe(token2[2]);
});

it("should throw error when receiving unsupported token version", () => {
  const version = "v9";
  const token = `${version}.PDw_Pz8-Pg.PDw_Pz8-Pg.PDw_Pz8-Pg`;

  expect(() => tokens.read(token)).toThrowError(
    `Token: Unsupported version: ${version}`,
  );
});

it("should throw error when receiving malformed token", () => {
  const token = "v111.2231..";

  expect(() => tokens.read(token)).toThrowError(
    `Token: Malformed token: ${token}`,
  );
});
