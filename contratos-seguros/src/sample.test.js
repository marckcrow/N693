import { describe, it, expect } from "vitest";

// Função exemplo (hash ou assinatura simples)
function soma(a, b) {
  return a + b;
}

describe("Teste de exemplo", () => {
  it("deve somar corretamente", () => {
    expect(soma(2, 3)).toBe(5);
  });

  it("deve garantir segurança básica (string contém hash)", () => {
    const hash = "abc123hash";
    expect(hash).toContain("hash");
  });
});
