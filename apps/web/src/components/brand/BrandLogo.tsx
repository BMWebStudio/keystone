import Image from "next/image";
import styles from "./BrandLogo.module.css";

export function BrandLogo({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const src =
    variant === "dark"
      ? "/brand/bm-logo-horizontal-dark.png"
      : "/brand/bm-logo-horizontal.png";

  return (
    <Image
      className={className ?? styles.logo}
      src={src}
      alt="BM Web Studio"
      width={640}
      height={128}
      priority
    />
  );
}
