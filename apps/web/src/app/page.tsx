import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles["landing-page"]}>
      <nav>
        <strong>BM / A11y Validator</strong>
        <Link href="/login">Sign in</Link>
      </nav>
      <section className={styles.hero}>
        <p>Platform-independent form accessibility</p>
        <h1>
          Better errors.
          <br />
          Better forms.
          <br />
          <em>Better access.</em>
        </h1>
        <span>
          Scan, configure, and install accessible form validation without
          rebuilding your forms or locking into one platform.
        </span>
        <div>
          <Link className={styles["cta-primary"]} href="/dashboard">
            Open demo dashboard
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
