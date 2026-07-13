import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { site } from "@/content/site";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const firstName = session.user.name?.split(" ")[0] ?? "Admin";

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgb(172_206_224_/_0.35),_transparent_70%)]"
        aria-hidden
      />

      <header className="relative border-b border-border/70 bg-surface/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link
              href="/admin/posts"
              className="font-display text-xl font-semibold text-foreground transition hover:text-primary-dark"
            >
              Redação
            </Link>
            <p className="text-xs text-muted">{site.name}</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/blog"
              className="text-sm text-muted transition hover:text-primary-dark"
            >
              Ver blog
            </Link>
            <span className="hidden text-sm text-muted sm:inline">
              Olá, {firstName}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary-dark"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
