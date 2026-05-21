import { site } from "@/content/site";

export function About() {
  return (
    <section
      id="sobre"
      className="scroll-mt-20 border-t border-border bg-primary-light/15 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {site.about.title}
            </h2>
            <div className="mt-6 space-y-4 text-muted leading-relaxed">
              {site.about.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <p className="mt-6 text-sm font-medium text-primary-dark">
              {site.professional.name}
              <span className="block font-normal text-muted">
                {site.professional.credential}
              </span>
            </p>
          </div>

          <ul className="space-y-4">
            {site.about.highlights.map((item) => (
              <li
                key={item}
                className="flex gap-4 rounded-2xl border border-border bg-background p-5"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary-dark"
                  aria-hidden
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
