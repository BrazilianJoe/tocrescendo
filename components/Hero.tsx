import { Logo } from "@/components/Logo";
import { site } from "@/content/site";
import { SocialButtonGroup } from "@/components/ui/SocialButtons";

function BadgeIcon({ type }: { type: "globe" | "map" }) {
  if (type === "globe") {
    return (
      <svg
        className="h-4 w-4 text-primary-dark"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-4 w-4 text-secondary-dark"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary-light/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary-light/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_minmax(260px,400px)] lg:gap-14">
        <div className="order-2 lg:order-1">
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[2.75rem] lg:leading-tight">
            {site.hero.headline}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {site.hero.subheadline}
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            {site.hero.badges.map((badge) => (
              <li
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                <BadgeIcon type={badge.icon} />
                {badge.label}
              </li>
            ))}
          </ul>

          <SocialButtonGroup
            className="mt-10"
            whatsappVariant="primary"
            instagramVariant="outline"
          />
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="rounded-3xl border border-border/60 bg-surface/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
            <Logo variant="hero" priority />
          </div>
        </div>
      </div>
    </section>
  );
}
