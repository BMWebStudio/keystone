import Link from "next/link";
import { BrandIcon } from "@/components/brand/BrandIcon";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles["landing-page"]}>
      <nav>
        <Link className={styles["brand-link"]} href="/">
          <BrandIcon />
          <span className={styles["brand-name"]}>
            Keystone
            <small>by BM Web Studio</small>
          </span>
        </Link>
        <div className={styles["nav-links"]}>
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </div>
      </nav>
      <section className={styles.hero}>
        <h1>Keystone</h1>
        <p className={styles["hero-descriptor"]}>
          Platform-independent form accessibility
        </p>
        <h2>
          Better errors.
          <br />
          Better forms.
          <br />
          <em>Better access.</em>
        </h2>
        <p className={styles["hero-lede"]}>
          Scan, configure, and install accessible form validation without
          rebuilding your forms or locking into one platform.
        </p>
        <div>
          <Link className={styles["cta-primary"]} href="/register">
            Create free account
          </Link>
          <Link
            className={styles["cta-secondary"]}
            href="/dashboard/playground"
          >
            Try the playground
          </Link>
        </div>
      </section>
      <section className={styles["feature-list"]}>
        <article>
          <b>01</b>
          <h2>Native HTML first</h2>
          <p>
            Uses required, type, minlength, pattern, labels, fieldsets, and
            established browser semantics before custom configuration.
          </p>
        </article>
        <article>
          <b>02</b>
          <h2>Reusable everywhere</h2>
          <p>
            A standalone JavaScript engine works anywhere the form DOM is
            accessible—including Webflow, React, WordPress, and plain HTML.
          </p>
        </article>
        <article>
          <b>03</b>
          <h2>WCAG-informed</h2>
          <p>
            Clear error identification, descriptions, focus management,
            summaries, and manual-review guidance.
          </p>
        </article>
      </section>
    </main>
  );
}
