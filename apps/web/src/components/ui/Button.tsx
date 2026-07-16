import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  iconStart?: ReactNode;
  isLoading?: boolean;
};

const sizeClass = {
  sm: styles["size-sm"],
  md: styles["size-md"],
  lg: styles["size-lg"],
} as const;

const variantClass = {
  primary: styles["variant-primary"],
  secondary: styles["variant-secondary"],
  ghost: styles["variant-ghost"],
  danger: styles["variant-danger"],
} as const;

export function Button({
  variant = "primary",
  size = "md",
  iconStart,
  isLoading = false,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={`${styles.button} ${variantClass[variant]} ${sizeClass[size]}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {iconStart}
      <span>{isLoading ? "Working…" : children}</span>
    </button>
  );
}
