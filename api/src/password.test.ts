import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("cifra con Argon2id y verifica el valor original", async () => {
    const hash = await hashPassword("Admin123!");
    expect(hash).not.toBe("Admin123!");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(hash, "Admin123!")).toBe(true);
    expect(await verifyPassword(hash, "otra")).toBe(false);
  });
});
