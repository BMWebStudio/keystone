import Link from "next/link";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import styles from "./login.module.css";

export default function Login() {
  return (
    <main className={styles["login-page"]}>
      <section>
        <Link href="/" className={styles["brand-link"]}>
          BM / A11y Validator
        </Link>
        <div>
          <p>Welcome back</p>
          <h1>Sign in to your workspace</h1>
          <span>
            Review projects, run scans, and manage accessible validation
            settings.
          </span>
        </div>
        <form>
          <FormField id="email" label="Email address">
            <input type="email" name="email" autoComplete="email" />
          </FormField>
          <FormField id="password" label="Password">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
            />
          </FormField>
          <Button type="submit">Sign in</Button>
        </form>
        <small>Demo foundation: connect this form to Supabase Auth.</small>
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
