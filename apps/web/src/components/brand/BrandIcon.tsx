import Image from "next/image";
import styles from "./BrandIcon.module.css";

export function BrandIcon({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "compact";
}) {
  return (
    <Image
      className={[styles.icon, size === "compact" && styles.compact, className]
        .filter(Boolean)
        .join(" ")}
      src="/brand/bm-icon.png"
      alt=""
      width={256}
      height={256}
      priority
    />
  );
}
