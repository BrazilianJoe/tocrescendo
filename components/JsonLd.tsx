import { site } from "@/content/site";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.seo.description,
    url: site.url,
    image: `${site.url}${site.assets.logoFull}`,
    telephone: `+${site.contact.whatsappPhone}`,
    areaServed: [
      {
        "@type": "City",
        name: "Porto Alegre",
        containedInPlace: { "@type": "State", name: "Rio Grande do Sul" },
      },
      { "@type": "Country", name: "Brasil" },
    ],
    serviceType: [
      "Neuropsicopedagogia",
      "Avaliação neuropsicopedagógica",
      "Avaliação TEA",
      "Avaliação TDAH",
      "Acompanhamento neuropsicopedagógico",
    ],
    provider: {
      "@type": "Person",
      name: site.professional.name,
      jobTitle: "Neuropsicopedagoga",
      identifier: site.professional.credential,
    },
    sameAs: [site.contact.instagram],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `https://wa.me/${site.contact.whatsappPhone}`,
      servicePhone: `+${site.contact.whatsappPhone}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
