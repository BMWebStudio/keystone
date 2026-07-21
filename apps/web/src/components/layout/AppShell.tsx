import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SidebarSignOutLink } from "@/components/layout/SidebarSignOutLink";
import styles from "./AppShell.module.css";

const links = [
  ["/dashboard", "Overview"],
  ["/dashboard/projects", "Projects"],
  ["/dashboard/playground", "Playground"],
  ["/dashboard/scans", "Scans"],
  ["/dashboard/instructions", "Instructions"],
  ["/dashboard/settings", "Settings"],
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles["app-shell"]}>
      <aside className={styles.sidebar}>
        <Link className={styles["brand-header"]} href="/dashboard">
          <h1 className={styles["product-name"]}>Keystone</h1>
          <p className={styles["product-descriptor"]}>
            Platform-independent form accessibility
          </p>
        </Link>
        <nav aria-label="Primary">
          <ul>
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
            <li>
              <SidebarSignOutLink />
            </li>
          </ul>
        </nav>
        <div className={styles["sidebar-note"]}>
          <strong>Accessibility first.</strong>
          <span>Native HTML, clear errors, better forms.</span>
        </div>
        <footer className={styles["sidebar-footer"]}>
          <Link className={styles["footer-brand-link"]} href="/dashboard">
            <BrandLogo variant="dark" className={styles["footer-logo"]} />
          </Link>
        </footer>
      </aside>
      <main className={styles["main-content"]}>{children}</main>
    </div>
  );
}
