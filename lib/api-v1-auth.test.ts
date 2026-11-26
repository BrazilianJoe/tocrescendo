import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isApiV1Authorized } from "@/lib/api-v1-auth";

const routeMocks = vi.hoisted(() => ({
  create: vi.fn(),
  getAuthorId: vi.fn(),
  list: vi.fn(),
  publishDue: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/api-v1-posts", () => ({
  ApiV1InputError: class ApiV1InputError extends Error {},
  createApiV1Post: routeMocks.create,
  createApiV1PostSchema: {
    safeParse: (value: unknown) => ({ success: true, data: value }),
  },
  drizzleApiV1PostStore: { list: routeMocks.list },
  getApiV1AuthorId: routeMocks.getAuthorId,
  publishDueApiV1Posts: routeMocks.publishDue,
}));

vi.mock("@/lib/revalidate-posts", () => ({
  revalidatePostPages: routeMocks.revalidate,
}));

import { GET, POST } from "@/app/api/v1/posts/route";
import * as post from "@/app/api/v1/posts/[idOrSlug]/route";
import { POST as upload } from "@/app/api/v1/upload/route";
import { GET as cron, HEAD as cronHead } from "@/app/api/cron/publish-scheduled/route";

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
    vi.unstubAllEnvs();
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

  it("mantém os dados e a paginação em uma resposta privada", async () => {
    routeMocks.list.mockResolvedValue([{ slug: "first" }, { slug: "next" }]);
    const response = await GET(new Request("https://example.test/api/v1/posts?pageSize=1", {
      headers: { authorization: `Bearer ${token}` },
    }));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({
      data: [{ slug: "first" }],
      pagination: { page: 1, pageSize: 1, hasMore: true, nextPage: 2 },
    });
  });

  it("protege todos os métodos da API e o cron sem acessar os dados", async () => {
    const params = { params: Promise.resolve({ idOrSlug: "artigo" }) };
    vi.stubEnv("CRON_SECRET", "cron-secret-for-tests");
    const responses = await Promise.all([
      GET(request()),
      post.GET(request(), params),
      post.PATCH(request(), params),
      post.DELETE(request(), params),
      upload(request()),
      cron(request(`Bearer ${token}`)),
    ]);
    expect(responses.map(({ status }) => status)).toEqual(Array(6).fill(401));
    expect(routeMocks.publishDue).not.toHaveBeenCalled();
  });

  it("só executa o cron com o segredo configurado e nunca usa HEAD para publicar", async () => {
    vi.stubEnv("CRON_SECRET", undefined);
    expect((await cron(request("Bearer cron-secret-for-tests"))).status).toBe(401);

    vi.stubEnv("CRON_SECRET", "cron-secret-for-tests");
    routeMocks.publishDue.mockResolvedValue([{ slug: "agendado" }]);
    expect(cronHead().status).toBe(405);
    const response = await cron(request("Bearer cron-secret-for-tests"));
    expect(await response.json()).toEqual({ published: 1 });
    expect(routeMocks.publishDue).toHaveBeenCalledOnce();
    expect(routeMocks.revalidate).toHaveBeenCalledWith({ slug: "agendado" });
  });

  it("limita o corpo multipart de uploads sem Content-Length", async () => {
    const form = new FormData();
    form.append("file", new File([new Uint8Array(4 * 1024 * 1024)], "image.png", { type: "image/png" }));
    form.append("alt", "a".repeat(300_000));
    const uploadRequest = new Request("https://example.test/api/v1/upload", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: form,
    });
    expect(uploadRequest.headers.get("content-length")).toBeNull();
    expect((await upload(uploadRequest)).status).toBe(413);
    expect(routeMocks.getAuthorId).not.toHaveBeenCalled();
  });
});
