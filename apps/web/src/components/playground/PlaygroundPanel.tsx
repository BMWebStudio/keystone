"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createValidator } from "@keystone/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/forms/FormField";
import { IssueCard } from "@/components/app/IssueCard";
import {
  buildScanPayload,
  type ScanIssue,
  type ScanPayload,
} from "@/lib/scans/build-payload";
import styles from "@/app/dashboard/playground/playground.module.css";

type ProjectOption = {
  id: string;
  name: string;
};

function issueSeverity(
  severity: string,
): "error" | "warning" | "manual" | "passed" {
  if (
    severity === "error" ||
    severity === "warning" ||
    severity === "manual" ||
    severity === "passed"
  ) {
    return severity;
  }

  return "warning";
}

export function PlaygroundPanel({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const playgroundRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [scanPayload, setScanPayload] = useState<ScanPayload | null>(null);
  const [scanIssues, setScanIssues] = useState<ScanIssue[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    if (!data.get("name")) next.name = "Enter your name.";
    const email = String(data.get("email") || "");
    if (!email) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter an email address in the format name@example.com.";
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        document.getElementById("playground-summary")?.focus(),
      );
    }
  };

  const runScan = () => {
    setFormError(null);
    setSaveMessage(null);
    setIsScanning(true);

    const root = playgroundRef.current;
    if (!root) {
      setFormError("Playground form is not ready.");
      setIsScanning(false);
      return;
    }

    const validator = createValidator();
    const report = validator.scan(root);
    const forms = validator.listForms(root);
    const fieldCount = forms.reduce((total, form) => total + form.fieldCount, 0);
    const payload = buildScanPayload(
      report,
      forms[0]?.identifier ?? "playground-contact",
      fieldCount,
    );

    setScanPayload(payload);
    setScanIssues(report.issues);
    setIsScanning(false);
  };

  const saveScan = async () => {
    setFormError(null);
    setSaveMessage(null);

    if (!selectedProjectId) {
      setFormError("Select a project before saving a scan.");
      return;
    }

    if (!scanPayload) {
      setFormError("Run a markup scan before saving.");
      return;
    }

    setIsSaving(true);

    const response = await fetch(
      `/api/projects/${selectedProjectId}/scans`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanPayload),
      },
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setFormError(payload.error ?? "Could not save scan.");
      setIsSaving(false);
      return;
    }

    setSaveMessage("Scan saved. View it on the Scans page.");
    setIsSaving(false);
    router.refresh();
  };

  return (
    <>
      <PageHeader
        eyebrow="Interactive lab"
        title="Form validation playground"
        description="Run markup scans against the sample form, then save results to a project for the dashboard and scans history."
        actions={
          <Link className={styles["header-link"]} href="/dashboard/scans">
            View scans
          </Link>
        }
      />

      <Card className={styles["scan-controls"]}>
        <CardHeader
          title="Save scan to project"
          meta={
            scanPayload ? (
              <Badge tone={scanPayload.error_count ? "danger" : "success"}>
                {scanPayload.error_count} errors · {scanPayload.warning_count}{" "}
                warnings
              </Badge>
            ) : (
              <Badge tone="info">No scan yet</Badge>
            )
          }
        />
        <CardContent>
          <div className={styles["scan-controls-row"]}>
            <FormField
              id="scan-project"
              label="Project"
              description="Saved scans appear on the overview and scans pages for this project."
            >
              <select
                id="scan-project"
                name="projectId"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                disabled={!projects.length}
              >
                {!projects.length ? (
                  <option value="">No projects yet</option>
                ) : (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                )}
              </select>
            </FormField>
            <div className={styles["scan-actions"]}>
              <Button type="button" onClick={runScan} isLoading={isScanning}>
                Run markup scan
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={saveScan}
                disabled={!scanPayload || !projects.length}
                isLoading={isSaving}
              >
                Save scan
              </Button>
            </div>
          </div>
          {!projects.length && (
            <p className={styles["inline-note"]}>
              <Link href="/dashboard/projects">Create a project</Link> before
              saving scans.
            </p>
          )}
          {formError && (
            <p className={styles["form-error"]} role="alert">
              {formError}
            </p>
          )}
          {saveMessage && (
            <p className={styles["save-message"]} role="status">
              {saveMessage}{" "}
              <Link href="/dashboard/scans">Open scans</Link>
            </p>
          )}
        </CardContent>
      </Card>

      <div className={styles["playground-grid"]}>
        <Card>
          <CardHeader title="Example contact form" />
          <CardContent>
            <div ref={playgroundRef}>
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
                data-keystone-form-id="playground-contact"
              >
                <FormField
                  id="name"
                  label="Name"
                  required
                  error={errors.name}
                >
                  <input id="name" name="name" autoComplete="name" />
                </FormField>
                <FormField
                  id="email"
                  label="Email address"
                  description="We will only use this to respond to your message."
                  required
                  error={errors.email}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                  />
                </FormField>
                <FormField id="message" label="How can we help?">
                  <textarea id="message" name="message" rows={5} />
                </FormField>
                <Button type="submit">Test validation</Button>
              </form>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Markup scan results"
            meta={
              scanIssues.length ? (
                <Badge tone="warning">{scanIssues.length} findings</Badge>
              ) : (
                <Badge tone="info">Run scan</Badge>
              )
            }
          />
          <CardContent>
            {!scanIssues.length ? (
              <p className={styles["inline-note"]}>
                Run a markup scan to inspect labels, grouping, duplicate ids,
                and other accessibility patterns from keystone-core.
              </p>
            ) : (
              scanIssues.map((issue) => (
                <IssueCard
                  key={`${issue.selector}-${issue.title}`}
                  severity={issueSeverity(issue.severity)}
                  title={issue.title}
                  selector={issue.selector}
                >
                  {issue.message}
                </IssueCard>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
