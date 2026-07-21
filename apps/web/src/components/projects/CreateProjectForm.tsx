"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import styles from "./projects-forms.module.css";

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Project name is required.");
      return;
    }

    setNameError(undefined);
    setIsLoading(true);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        domain: domain.trim() || undefined,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setFormError(payload.error ?? "Could not create project.");
      setIsLoading(false);
      return;
    }

    setName("");
    setDomain("");
    setSuccessMessage("Project created.");
    setIsLoading(false);
    router.refresh();

    if (payload.id) {
      router.push(`/dashboard/projects/${payload.id}`);
    }
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
      <form className={styles["project-form"]} onSubmit={handleSubmit} noValidate>
        <FormField
          id="project-name"
          label="Project name"
          description="A label you will recognize in the dashboard."
          error={nameError}
          required
        >
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>
        <FormField
          id="project-domain"
          label="Domain"
          description="Optional. Helps you remember where the script is installed."
        >
          <input
            name="domain"
            placeholder="example.com"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          />
        </FormField>
        <Button type="submit" isLoading={isLoading}>
          Create project
        </Button>
      </form>
    </>
  );
}
