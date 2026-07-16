import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className={`${styles.card} ${className}`} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  meta,
}: {
  title: string;
  meta?: ReactNode;
}) {
  return (
    <header className={styles["card-header"]}>
      <h2>{title}</h2>
      {meta}
    </header>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className={styles["card-content"]}>{children}</div>;
}
