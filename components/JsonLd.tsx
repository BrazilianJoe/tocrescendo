import { site } from "@/content/site";
import { whatsappUrl } from "@/lib/links";

export function JsonLd() {
  const { address, bookingUrl, instagram, openingHours, whatsappPhone, x } =
    site.contact;
  const founderId = `${site.url}/#michelle`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#tocrescendo`,
    name: site.name,
    description: site.seo.description,
    url: site.url,
    image: `${site.url}${site.assets.logoFull}`,
    telephone: `+${whatsappPhone}`,
    address: { "@type": "PostalAddress", ...address },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: openingHours.dayOfWeek,
      opens: openingHours.opens,
      closes: openingHours.closes,
    },
    areaServed: [
      {
        "@type": "City",
        name: address.addressLocality,
        containedInPlace: { "@type": "State", name: "Rio Grande do Sul" },
      },
      "Região Metropolitana de Porto Alegre",
      { "@type": "Country", name: "Brasil" },
    ],
    founder: {
      "@type": "Person",
      "@id": founderId,
      name: site.professional.name,
      jobTitle: "Neuropsicopedagoga",
      identifier: site.professional.credential,
    },
    sameAs: [instagram, x],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: site.tagline,
        description: site.professional.serviceArea,
        provider: { "@id": founderId },
        serviceType: [
          site.tagline,
          "Avaliação neuropsicopedagógica",
          "Avaliação de TEA",
          "Avaliação de TDAH",
          "Acompanhamento neuropsicopedagógico",
          "Orientação à família e à escola",
        ],
        availableChannel: [
          {
            "@type": "ServiceChannel",
            name: "WhatsApp",
            serviceUrl: whatsappUrl(),
          },
          {
            "@type": "ServiceChannel",
            name: "Agendamento online",
            serviceUrl: bookingUrl,
          },
        ],
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
