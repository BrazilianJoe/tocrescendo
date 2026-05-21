import { site } from "@/content/site";

export function Audience() {
  return (
    <section
      id="para-quem"
      className="scroll-mt-20 border-t border-border bg-secondary-light/20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {site.audience.title}
          </h2>
          <p className="mt-4 text-lg text-muted">{site.audience.subtitle}</p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {site.audience.items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
