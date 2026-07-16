"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { IssueCard } from "@/components/app/IssueCard";
import styles from "./playground.module.css";

export default function Playground() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!data.get("name")) next.name = "Enter your name.";
    const email = String(data.get("email") || "");
    if (!email) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter an email address in the format name@example.com.";
    setErrors(next);
    if (Object.keys(next).length)
      requestAnimationFrame(() =>
        document.getElementById("playground-summary")?.focus(),
      );
  };

  return (
    <>
      <PageHeader
        eyebrow="Interactive lab"
        title="Form validation playground"
        description="Trigger errors, inspect the accessible output, and compare field states without leaving the dashboard."
      />
      <div className={styles["playground-grid"]}>
        <Card>
          <CardHeader title="Example contact form" />
          <CardContent>
            {Object.keys(errors).length > 0 && (
              <div
                id="playground-summary"
                tabIndex={-1}
                className={styles["error-summary"]}
                role="alert"
                aria-labelledby="summary-heading"
              >
                <h2 id="summary-heading">
                  There are {Object.keys(errors).length} errors
                </h2>
                <ul>
                  {Object.entries(errors).map(([id, msg]) => (
                    <li key={id}>
                      <a href={`#${id}`}>{msg}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <form
              onSubmit={submit}
              noValidate
              className={styles["playground-form"]}
            >
              <FormField id="name" label="Name" required error={errors.name}>
                <input name="name" autoComplete="name" />
              </FormField>
              <FormField
                id="email"
                label="Email address"
                description="We will only use this to respond to your message."
                required
                error={errors.email}
              >
                <input name="email" type="email" autoComplete="email" />
              </FormField>
              <FormField id="message" label="How can we help?">
                <textarea name="message" rows={5} />
              </FormField>
              <Button type="submit">Test validation</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Live scan notes" />
          <CardContent>
            <IssueCard
              severity="passed"
              title="Every field has a visible label"
              selector="form label"
            >
              Labels are explicitly associated with their controls using
              matching for and id values.
            </IssueCard>
            <IssueCard
              severity="passed"
              title="Errors are programmatically described"
              selector="[aria-describedby]"
            >
              Invalid fields reference their own helper and error messages
              without replacing existing descriptions.
            </IssueCard>
            <IssueCard
              severity="manual"
              title="Review announcement timing"
              selector="#playground-summary"
            >
              Test repeated submissions with NVDA, VoiceOver, or another screen
              reader.
            </IssueCard>
            <pre className={styles["code-block"]}>
              <code>{`<input
  id="email"
  type="email"
  required
  aria-invalid="true"
  aria-describedby="email-description email-error"
/>`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
