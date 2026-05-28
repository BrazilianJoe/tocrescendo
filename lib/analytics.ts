export type GaEventName =
  | "cta_booking_click"
  | "cta_whatsapp_click"
  | "cta_whatsapp_floating_click"
  | "cta_whatsapp_footer_click"
  | "cta_instagram_click"
  | "cta_instagram_footer_click"
  | "cta_phone_click";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

export function trackEvent(name: GaEventName) {
  if (typeof window === "undefined") return;

  // GA4
  window.gtag?.("event", name);

  // Clarity (optional – will be wired later if enabled)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.clarity?.("event", name);
}

