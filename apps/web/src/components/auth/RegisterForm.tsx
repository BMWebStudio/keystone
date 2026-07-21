"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth-forms.module.css";

function getDisplayNameError(value: string) {
  if (!value.trim()) return "Display name is required.";
  if (value.length < 3 || value.length > 20) {
    return "Display name must be 3–20 characters.";
  }
  if (!/^[a-zA-Z0-9 _-]+$/.test(value)) {
    return "Use letters, numbers, spaces, hyphens, or underscores only.";
  }
  return undefined;
}

function getEmailError(value: string) {
  if (!value.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

function getPasswordError(value: string) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextDisplayNameError = getDisplayNameError(displayName);
    const nextEmailError = getEmailError(email);
    const nextPasswordError = getPasswordError(password);
    setDisplayNameError(nextDisplayNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    setSuccessMessage(null);

    if (nextDisplayNameError || nextEmailError || nextPasswordError) return;

    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
      },
    });

    if (error) {
      setFormError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccessMessage(
      "Account created. Check your email if confirmation is required, then sign in.",
    );
    setIsLoading(false);
  }

  return (
    <>
      {formError && (
        <p className={styles["form-message-error"]} role="alert">
          {formError}
        </p>
      )}
      {successMessage && (
        <p className={styles["form-message-success"]} role="status">
          {successMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="display-name"
          label="Display name"
          description="Shown in your dashboard greeting."
          error={displayNameError}
          required
        >
          <input
            type="text"
            name="displayName"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </FormField>
        <FormField
          id="email"
          label="Email address"
          error={emailError}
          required
        >
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          description="At least 8 characters."
          error={passwordError}
          required
        >
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>
        <Button type="submit" isLoading={isLoading}>
          Create account
        </Button>
      </form>
      <p className={styles["form-footer"]}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
