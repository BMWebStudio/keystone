import type { ReactNode } from "react";
import styles from "./Badge.module.css";

const toneClass = {
  neutral: styles["tone-neutral"],
  success: styles["tone-success"],
  warning: styles["tone-warning"],
  danger: styles["tone-danger"],
  info: styles["tone-info"],
} as const;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  return (
    <span className={`${styles.badge} ${toneClass[tone]}`}>{children}</span>
  );
}
