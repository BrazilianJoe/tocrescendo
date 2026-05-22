import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/content/site";
import { phoneTelUrl, whatsappUrl } from "@/lib/links";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Logo variant="footer" />
          <div className="sm:ml-2 sm:pt-1">
            <p className="mt-2 text-sm font-medium text-foreground sm:mt-0">
              {site.professional.name}
            </p>
            <p className="text-sm text-muted">{site.professional.credential}</p>
            <p className="text-sm text-muted">{site.professional.serviceArea}</p>
            <p className="mt-2 text-sm">
              <Link
                href={phoneTelUrl()}
                className="font-medium text-primary-dark hover:underline"
              >
                {site.contact.phoneDisplay}
              </Link>
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Links do rodapé">
          <Link
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-dark hover:underline"
          >
            WhatsApp
          </Link>
          <Link
            href={site.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-secondary-dark hover:underline"
          >
            Instagram
          </Link>
          <Link
            href="/privacidade"
            className="text-sm font-medium text-muted hover:text-primary-dark hover:underline"
          >
            Privacidade
          </Link>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-muted sm:text-left">
        © {year} {site.name}. Todos os direitos reservados.
      </p>
    </footer>
  );
}
