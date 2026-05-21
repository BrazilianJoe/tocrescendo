import Link from "next/link";
import { site } from "@/content/site";

const pillarStyles = [
  "border-t-4 border-t-primary",
  "border-t-4 border-t-secondary",
  "border-t-4 border-t-primary-dark",
] as const;

function ModalityIcon({ type }: { type: "globe" | "map" }) {
  const className = "h-5 w-5 shrink-0 text-primary-dark";
  if (type === "globe") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function Services() {
  return (
    <section
      id="atendimento"
      className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {site.services.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {site.services.subtitle}
          </p>
        </div>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {site.services.pillars.map((pillar, index) => (
            <li key={pillar.title}>
              <article
                className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7 ${pillarStyles[index]}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {pillar.highlight}
                </p>
                <h3 className="font-display mt-2 text-xl font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {pillar.description}
                </p>
                <ul className="mt-5 space-y-2 border-t border-border pt-5">
                  {pillar.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-2 text-sm leading-relaxed text-foreground"
                    >
                      <span className="text-primary-dark" aria-hidden>
                        •
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-background px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">
            Todas as modalidades disponíveis em:
          </p>
          <ul className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            {site.services.modalities.map((mod) => (
              <li
                key={mod.title}
                className="flex items-center gap-2 text-sm text-muted"
              >
                <ModalityIcon type={mod.icon} />
                <span>
                  <strong className="font-medium text-foreground">
                    {mod.title}
                  </strong>
                  {" — "}
                  {mod.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          <Link
            href="#para-quem"
            className="font-medium text-primary-dark underline-offset-4 hover:underline"
          >
            {site.services.audienceLink}
          </Link>
        </p>

        <div className="mt-10 rounded-2xl border border-primary-light bg-primary-light/20 p-8 sm:p-10">
          <h3 className="font-display text-xl font-semibold text-foreground">
            {site.services.firstSession.title}
          </h3>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">
            {site.services.firstSession.text}
          </p>
        </div>
      </div>
    </section>
  );
}
