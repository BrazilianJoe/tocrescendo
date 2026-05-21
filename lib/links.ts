import { site } from "@/content/site";

export function whatsappUrl(
  phone = site.contact.whatsappPhone,
  message = site.contact.whatsappMessage,
): string {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${phone}?${params.toString()}`;
}
