import { site } from "@/content/site";
import { SocialButtonGroup } from "@/components/ui/SocialButtons";

export function CTA() {
  return (
    <section
      id="contato"
      className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-4xl rounded-3xl bg-linear-to-br from-primary-dark via-primary to-secondary px-6 py-14 text-center text-white sm:px-12 sm:py-16 shadow-lg shadow-primary/20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          {site.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
          {site.cta.subtitle}
        </p>
        <SocialButtonGroup
          className="mt-10 justify-center"
          whatsappVariant="light"
          instagramVariant="light-outline"
        />
      </div>
    </section>
  );
}
