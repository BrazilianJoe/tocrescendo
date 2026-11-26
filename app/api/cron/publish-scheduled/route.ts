import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/api-v1-auth";
import { publishDueApiV1Posts } from "@/lib/api-v1-posts";
import { revalidatePostPages } from "@/lib/revalidate-posts";

export const runtime = "nodejs";

export function HEAD() {
  return new Response(null, { status: 405, headers: { Allow: "GET, OPTIONS" } });
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const published = await publishDueApiV1Posts();
    for (const post of published) revalidatePostPages(post);
    return NextResponse.json(
      { published: published.length },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível publicar os artigos agendados" },
      { status: 500 },
    );
  }
}
