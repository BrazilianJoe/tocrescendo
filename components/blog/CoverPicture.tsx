type CoverProps = {
  avifUrl?: string | null;
  webpUrl?: string | null;
  alt?: string | null;
  className?: string;
  priority?: boolean;
};

export function CoverPicture({
  avifUrl,
  webpUrl,
  alt = "",
  className = "",
  priority = false,
}: CoverProps) {
  if (!webpUrl && !avifUrl) return null;

  return (
    <picture>
      {avifUrl ? <source srcSet={avifUrl} type="image/avif" /> : null}
      {webpUrl ? <source srcSet={webpUrl} type="image/webp" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={webpUrl || avifUrl || ""}
        alt={alt || ""}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}
