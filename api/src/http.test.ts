import { describe, expect, it } from "vitest";
import { uniqueConflictMessage } from "./http";

describe("uniqueConflictMessage", () => {
  it("mapea targets de Prisma a mensaje 409", () => {
    expect(uniqueConflictMessage(["email"])).toBe("El email ya está en uso");
    expect(uniqueConflictMessage(["rut"])).toBe("El RUT ya está en uso");
    expect(uniqueConflictMessage(["sku"])).toBe("El SKU ya está en uso");
    expect(uniqueConflictMessage(["rutEmpresa"])).toBe(
      "El RUT de empresa ya está en uso",
    );
  });
});
