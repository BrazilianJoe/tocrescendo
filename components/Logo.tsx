import Image from "next/image";
import { site } from "@/content/site";

type LogoVariant = "full" | "mark" | "hero" | "footer";

const sizes: Record<
  LogoVariant,
  { src: string; width: number; height: number; className: string; sizes: string }
> = {
  full: {
    src: site.assets.logoFull,
    width: 2730,
    height: 1536,
    className: "h-11 w-auto sm:h-14",
    sizes: "(max-width: 640px) 180px, 220px",
  },
  hero: {
    src: site.assets.logoFull,
    width: 2730,
    height: 1536,
    className: "h-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px]",
    sizes: "(max-width: 640px) 280px, (max-width: 1024px) 320px, 380px",
  },
  footer: {
    src: site.assets.logoFull,
    width: 2730,
    height: 1536,
    className: "h-auto w-full max-w-[200px] sm:max-w-[220px]",
    sizes: "220px",
  },
  mark: {
    src: site.assets.logoMark,
    width: 2560,
    height: 1440,
    className: "h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11",
    sizes: "44px",
  },
};

export function Logo({
  variant = "full",
  priority = false,
  className = "",
}: {
  variant?: LogoVariant;
  priority?: boolean;
  className?: string;
}) {
  const config = sizes[variant];

  return (
    <Image
      src={config.src}
      alt={`${site.name} — ${site.tagline}`}
      width={config.width}
      height={config.height}
      className={`${config.className} ${className}`.trim()}
      priority={priority}
      sizes={config.sizes}
    />
  );
}
