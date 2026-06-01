import Image from "next/image";
import { site } from "@/content/site";

export function Bio() {
  return (
    <section
      id="bio"
      className="scroll-mt-20 border-t border-border bg-primary-light/15 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {site.bio.title}
          </h2>
        </div>

        <article className="mt-10 rounded-2xl border border-border border-t-4 border-t-primary bg-surface p-6 shadow-sm sm:mt-12 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-10 lg:items-start">
            <div className="shrink-0 sm:pt-1">
              <div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-border bg-primary-light/20 shadow-sm sm:mx-0 sm:h-32 sm:w-32">
                <Image
                  src={site.assets.bioPhoto}
                  alt={site.bio.photoAlt}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover object-top"
                  sizes="(max-width: 640px) 112px, 128px"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-medium text-foreground">
                {site.professional.name}
              </p>
              <p className="mt-1 text-muted">{site.professional.credential}</p>

              <div className="mt-6 space-y-4 leading-relaxed text-muted">
                {site.bio.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
