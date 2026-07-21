import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BrandIcon } from "@/components/brand/BrandIcon";
import styles from "../login/login.module.css";

export default function Register() {
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
          <p>Get started</p>
          <h1>Create your workspace</h1>
          <span>
            Set up projects, generate embed keys, and track accessible form
            validation across your sites.
          </span>
        </div>
        <RegisterForm />
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
