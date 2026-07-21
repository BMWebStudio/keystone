import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandIcon } from "@/components/brand/BrandIcon";
import styles from "./login.module.css";

export default function Login() {
  return (
    <main className={styles["login-page"]}>
      <section>
        <Link href="/" className={styles["brand-link"]}>
          <BrandIcon size="compact" />
          <span>
            Keystone
            <small>by BM Web Studio</small>
          </span>
        </Link>
        <div>
          <p>Welcome back</p>
          <h1>Sign in to your workspace</h1>
          <span>
            Review projects, run scans, and manage accessible validation
            settings.
          </span>
        </div>
        <Suspense fallback={<p>Loading sign-in form…</p>}>
          <LoginForm />
        </Suspense>
      </section>
      <aside>
        <p>
          “Accessible form errors should help people recover—not make them
          guess.”
        </p>
        <span>
          Built with the same practical, human-centered approach as BM Web
          Studio.
        </span>
      </aside>
    </main>
  );
}
