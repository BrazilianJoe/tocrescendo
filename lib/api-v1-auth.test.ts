import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isApiV1Authorized } from "@/lib/api-v1-auth";

const routeMocks = vi.hoisted(() => ({
  create: vi.fn(),
  getAuthorId: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/api-v1-posts", () => ({
  ApiV1InputError: class ApiV1InputError extends Error {},
  createApiV1Post: routeMocks.create,
  createApiV1PostSchema: {
    safeParse: (value: unknown) => ({ success: true, data: value }),
  },
  drizzleApiV1PostStore: {},
  getApiV1AuthorId: routeMocks.getAuthorId,
}));

vi.mock("@/lib/revalidate-posts", () => ({
  revalidatePostPages: routeMocks.revalidate,
}));

import { POST } from "@/app/api/v1/posts/route";

const token = "token-de-teste-com-entropia-suficiente";
const tokenHash = createHash("sha256").update(token).digest("hex");

function request(authorization?: string): Request {
  return new Request("https://example.test/api/v1/posts", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify({ title: "Artigo" }),
  });
}

describe("autenticação da API v1", () => {
  const previousHash = process.env.API_V1_TOKEN_HASH;

  beforeEach(() => {
    process.env.API_V1_TOKEN_HASH = tokenHash;
    routeMocks.getAuthorId.mockReturnValue("00000000-0000-4000-8000-000000000001");
    routeMocks.create.mockResolvedValue({ status: "DRAFT", slug: "artigo" });
  });

  afterEach(() => {
    if (previousHash === undefined) delete process.env.API_V1_TOKEN_HASH;
    else process.env.API_V1_TOKEN_HASH = previousHash;
    vi.clearAllMocks();
  });

  it.each([
    ["sem cabeçalho", undefined],
    ["cabeçalho malformado", `Token ${token}`],
    ["token incorreto", "Bearer token-errado"],
  ])("devolve 401 para %s", async (_label, authorization) => {
    const response = await POST(request(authorization));
    expect(response.status).toBe(401);
  });

  it("aceita o token válido", async () => {
    expect(isApiV1Authorized(request(`Bearer ${token}`))).toBe(true);

    const response = await POST(request(`Bearer ${token}`));
    expect(response.status).toBe(201);
    expect(routeMocks.create).toHaveBeenCalledOnce();
  });

  it("rejeita hash configurado com tamanho inválido sem lançar", () => {
    process.env.API_V1_TOKEN_HASH = "abc";
    expect(() => isApiV1Authorized(request(`Bearer ${token}`))).not.toThrow();
    expect(isApiV1Authorized(request(`Bearer ${token}`))).toBe(false);
  });
});
