"use client";

type Props = {
  variant?: "white" | "light";
  className?: string;
  priority?: boolean;
};

/**
 * Official İzden mark — same assets as Multibelediye (2× retina PNG, transparent).
 */
export function Logo({ variant = "light", className = "", priority }: Props) {
  const src =
    variant === "white"
      ? "/brand/logo-white.png?v=9"
      : "/brand/logo-on-light.png?v=9";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="İzden Creative"
      width={372}
      height={127}
      className={`izden-logo ${className}`.trim()}
      decoding="async"
      draggable={false}
      style={{ maxWidth: "100%", height: "auto" }}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
