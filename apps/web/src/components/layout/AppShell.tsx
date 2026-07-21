import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./AppShell.module.css";

const links = [
  ["/dashboard", "Overview"],
  ["/dashboard/projects", "Projects"],
  ["/dashboard/playground", "Playground"],
  ["/dashboard/scans", "Scans"],
  ["/dashboard/settings", "Settings"],
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles["app-shell"]}>
      <aside className={styles.sidebar}>
        <Link className={styles["brand-link"]} href="/dashboard">
          <span className={styles["brand-mark"]}>BM</span>
          <span>
            Keystone<small>by BM Web Studio</small>
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul>
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles["sidebar-note"]}>
          <strong>Accessibility first.</strong>
          <span>Native HTML, clear errors, better forms.</span>
        </div>
      </aside>
      <main className={styles["main-content"]}>{children}</main>
    </div>
  );
}
