import Link from "next/link";
import { site } from "@/content/site";

export function Brand({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="#"
      className={`group shrink-0 ${className}`.trim()}
      onClick={onClick}
    >
      <span className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary-dark sm:text-xl">
        {site.name}
      </span>
      <span className="block text-xs text-muted sm:text-sm">{site.tagline}</span>
    </Link>
  );
}
