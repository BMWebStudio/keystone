"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth-forms.module.css";

export function ProfileForm({
  userId,
  email,
  initialDisplayName,
}: {
  userId: string;
  email: string;
  initialDisplayName: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [displayNameError, setDisplayNameError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setDisplayNameError("Display name is required.");
      return;
    }

    setDisplayNameError(undefined);
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmedName, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      setFormError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccessMessage("Profile updated.");
    setIsLoading(false);
    router.refresh();
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
      <form onSubmit={handleSubmit}>
        <FormField
          id="display-name"
          label="Display name"
          description="Shown in the dashboard greeting and shared project views."
          error={displayNameError}
          required
        >
          <input
            name="displayName"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </FormField>
        <FormField
          id="email"
          label="Email address"
          description="Sign-in address for this workspace."
        >
          <input
            name="email"
            type="email"
            defaultValue={email}
            autoComplete="email"
            readOnly
          />
        </FormField>
        <Button type="submit" isLoading={isLoading}>
          Update profile
        </Button>
      </form>
    </>
  );
}
