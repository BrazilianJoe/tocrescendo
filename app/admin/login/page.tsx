import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { site } from "@/content/site";
import { auth } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin/posts");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary-light/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-secondary-light/45 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
          Área restrita
        </p>
        <h1 className="font-display mt-3 text-center text-4xl font-semibold tracking-tight text-foreground">
          {site.name}
        </h1>
        <p className="mt-2 text-center text-muted">
          Entre para escrever e publicar no blog
        </p>

        <div className="mt-10 rounded-[1.75rem] border border-border/80 bg-surface/90 p-7 shadow-[0_20px_50px_-28px_rgb(90_143_176_/_0.55)] backdrop-blur-sm sm:p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
