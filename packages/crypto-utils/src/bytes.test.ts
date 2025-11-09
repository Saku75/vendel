import { describe, expect, it } from "vitest";

import {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  bytesToString,
  hexToBytes,
  stringToBytes,
} from "./bytes";

describe("bytesToHex", () => {
  it("should convert Uint8Array to hex string", () => {
    const bytes = new Uint8Array([0, 255, 16, 254]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe("00ff10fe");
  });

  it("should handle empty Uint8Array", () => {
    const bytes = new Uint8Array([]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe("");
  });

  it("should handle single byte", () => {
    const bytes = new Uint8Array([42]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe("2a");
  });

  it("should convert all byte values correctly", () => {
    const bytes = new Uint8Array([0, 1, 15, 16, 127, 128, 254, 255]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe("00010f107f80feff");
  });
});

describe("hexToBytes", () => {
  it("should convert hex string to Uint8Array", () => {
    const hex = "00ff10fe";
    const bytes = hexToBytes(hex);
    expect(bytes).toEqual(new Uint8Array([0, 255, 16, 254]));
  });

  it("should handle empty string", () => {
    const hex = "";
    const bytes = hexToBytes(hex);
    expect(bytes).toEqual(new Uint8Array([]));
  });

  it("should handle uppercase hex", () => {
    const hex = "DEADBEEF";
    const bytes = hexToBytes(hex);
    expect(bytes).toEqual(new Uint8Array([222, 173, 190, 239]));
  });

  it("should handle mixed case hex", () => {
    const hex = "DeAdBeEf";
    const bytes = hexToBytes(hex);
    expect(bytes).toEqual(new Uint8Array([222, 173, 190, 239]));
  });
});

describe("bytesToBase64", () => {
  it("should convert Uint8Array to base64 string", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    const base64 = bytesToBase64(bytes);
    expect(base64).toBe("SGVsbG8");
  });

  it("should handle empty Uint8Array", () => {
    const bytes = new Uint8Array([]);
    const base64 = bytesToBase64(bytes);
    expect(base64).toBe("");
  });

  it("should handle various byte lengths", () => {
    // Length 1
    const bytes1 = new Uint8Array([65]);
    expect(bytesToBase64(bytes1)).toBe("QQ");

    // Length 2
    const bytes2 = new Uint8Array([65, 66]);
    expect(bytesToBase64(bytes2)).toBe("QUI");

    // Length 3 (no padding)
    const bytes3 = new Uint8Array([65, 66, 67]);
    expect(bytesToBase64(bytes3)).toBe("QUJD");
  });

  it("should handle binary data", () => {
    const bytes = new Uint8Array([0, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
    const base64 = bytesToBase64(bytes);
    expect(base64).toBeTruthy();
    expect(typeof base64).toBe("string");
  });
});

describe("base64ToBytes", () => {
  it("should convert base64 string to Uint8Array", () => {
    const base64 = "SGVsbG8";
    const bytes = base64ToBytes(base64);
    expect(bytes).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
  });

  it("should handle empty string", () => {
    const base64 = "";
    const bytes = base64ToBytes(base64);
    expect(bytes).toEqual(new Uint8Array([]));
  });

  it("should handle base64 with different padding", () => {
    expect(base64ToBytes("QQ")).toEqual(new Uint8Array([65]));

    expect(base64ToBytes("QUI")).toEqual(new Uint8Array([65, 66]));

    expect(base64ToBytes("QUJD")).toEqual(new Uint8Array([65, 66, 67]));
  });
});

describe("hex round-trip conversions", () => {
  it("should convert bytes -> hex -> bytes correctly", () => {
    const original = new Uint8Array([0, 1, 2, 255, 254, 253, 128, 127]);
    const hex = bytesToHex(original);
    const converted = hexToBytes(hex);
    expect(converted).toEqual(original);
  });

  it("should convert hex -> bytes -> hex correctly", () => {
    const original = "00ff7f8001020304";
    const bytes = hexToBytes(original);
    const converted = bytesToHex(bytes);
    expect(converted).toBe(original);
  });

  it("should handle uppercase hex in round-trip", () => {
    const original = "DEADBEEF";
    const bytes = hexToBytes(original);
    const converted = bytesToHex(bytes);
    expect(converted).toBe(original.toLowerCase());
  });
});

describe("base64 round-trip conversions", () => {
  it("should convert bytes -> base64 -> bytes correctly", () => {
    const original = new Uint8Array([
      72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
    ]);
    const base64 = bytesToBase64(original);
    const converted = base64ToBytes(base64);
    expect(converted).toEqual(original);
  });

  it("should convert base64 -> bytes -> base64 correctly", () => {
    const original = "SGVsbG8gV29ybGQ";
    const bytes = base64ToBytes(original);
    const converted = bytesToBase64(bytes);
    expect(converted).toBe(original);
  });

  it("should handle large byte arrays in round-trip", () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      original[i] = i;
    }
    const base64 = bytesToBase64(original);
    const converted = base64ToBytes(base64);
    expect(converted).toEqual(original);
  });
});

describe("cross-format conversions", () => {
  it("should convert between hex and base64 via bytes", () => {
    const hex = "48656c6c6f";
    const bytes = hexToBytes(hex);
    const base64 = bytesToBase64(bytes);
    expect(base64).toBe("SGVsbG8");

    const bytesFromBase64 = base64ToBytes(base64);
    const hexFromBytes = bytesToHex(bytesFromBase64);
    expect(hexFromBytes).toBe(hex);
  });
});

describe("stringToBytes", () => {
  it("should convert UTF-8 string to Uint8Array", () => {
    const str = "Hello";
    const bytes = stringToBytes(str);
    expect(bytes).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
  });

  it("should handle empty string", () => {
    const str = "";
    const bytes = stringToBytes(str);
    expect(bytes).toEqual(new Uint8Array([]));
  });

  it("should handle Unicode characters", () => {
    const str = "Hello 世界";
    const bytes = stringToBytes(str);
    expect(bytes.length).toBeGreaterThan(str.length); // Multi-byte characters
  });

  it("should handle emojis", () => {
    const str = "Hello 👋";
    const bytes = stringToBytes(str);
    expect(bytes.length).toBeGreaterThan(str.length);
  });

  it("should handle special characters", () => {
    const str = "Hello\nWorld\t!";
    const bytes = stringToBytes(str);
    expect(bytes.length).toBe(13);
  });
});

describe("bytesToString", () => {
  it("should convert Uint8Array to UTF-8 string", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    const str = bytesToString(bytes);
    expect(str).toBe("Hello");
  });

  it("should handle empty Uint8Array", () => {
    const bytes = new Uint8Array([]);
    const str = bytesToString(bytes);
    expect(str).toBe("");
  });

  it("should handle Unicode characters", () => {
    const original = "Hello 世界";
    const bytes = stringToBytes(original);
    const str = bytesToString(bytes);
    expect(str).toBe(original);
  });

  it("should handle emojis", () => {
    const original = "Hello 👋";
    const bytes = stringToBytes(original);
    const str = bytesToString(bytes);
    expect(str).toBe(original);
  });
});

describe("string round-trip conversions", () => {
  it("should convert string -> bytes -> string correctly", () => {
    const original = "Hello, World!";
    const bytes = stringToBytes(original);
    const converted = bytesToString(bytes);
    expect(converted).toBe(original);
  });

  it("should handle complex Unicode in round-trip", () => {
    const original = "Hello 世界 👋 Здравствуй مرحبا";
    const bytes = stringToBytes(original);
    const converted = bytesToString(bytes);
    expect(converted).toBe(original);
  });

  it("should handle JSON in round-trip", () => {
    const original = JSON.stringify({ hello: "world", count: 42 });
    const bytes = stringToBytes(original);
    const converted = bytesToString(bytes);
    expect(converted).toBe(original);
  });
});
