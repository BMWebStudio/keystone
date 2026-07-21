"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createValidator, fetchProjectConfig } from "@keystone/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/forms/FormField";
import { PlaygroundFormField } from "@/components/playground/PlaygroundFormField";
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
  public_key: string;
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

type PlaygroundFieldKey = "phone" | "url" | "message";

const DEFAULT_REQUIRED_FIELDS: Record<PlaygroundFieldKey, boolean> = {
  phone: false,
  url: false,
  message: false,
};

function resetPlaygroundForm(root: HTMLElement) {
  const form = root.querySelector("form");
  if (!form) return;

  delete form.dataset.keystoneBound;
  delete form.dataset.keystoneSubmitAttempted;
  form.querySelectorAll("input,select,textarea").forEach((field) => {
    delete (field as HTMLElement).dataset.keystoneDirty;
    field.removeAttribute("aria-invalid");
    field.classList.remove("keystone-field-invalid", "a11y-field-invalid");
  });
  root
    .querySelectorAll(".keystone-field-error, .a11y-field-error")
    .forEach((el) => el.remove());
}

function clearPlaygroundField(root: HTMLElement, fieldId: string) {
  const field = root.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`);
  if (!field) return;

  delete field.dataset.keystoneDirty;
  const errorId = `${field.id}-error`;
  root.querySelector(`#${CSS.escape(errorId)}`)?.remove();
  field.removeAttribute("aria-invalid");
  field.classList.remove("keystone-field-invalid", "a11y-field-invalid");
  const refs = (field.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((value) => value !== errorId);
  if (refs.length) field.setAttribute("aria-describedby", refs.join(" "));
  else field.removeAttribute("aria-describedby");
}

function formatValidationMode(modes: string[]) {
  if (modes.includes("blur")) return "Blur + submit (Recommended)";
  return "Submit only";
}

export function PlaygroundPanel({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const playgroundRef = useRef<HTMLDivElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [validationModeLabel, setValidationModeLabel] = useState(
    "Blur + submit (Recommended)",
  );
  const [configNotice, setConfigNotice] = useState<string | null>(null);
  const [scanPayload, setScanPayload] = useState<ScanPayload | null>(null);
  const [scanIssues, setScanIssues] = useState<ScanIssue[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [requiredFields, setRequiredFields] = useState(DEFAULT_REQUIRED_FIELDS);

  const handleRequiredChange = (
    fieldId: PlaygroundFieldKey,
    isRequired: boolean,
  ) => {
    setRequiredFields((current) => ({ ...current, [fieldId]: isRequired }));

    const root = playgroundRef.current;
    if (!root) return;

    if (!isRequired) {
      clearPlaygroundField(root, fieldId);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const root = playgroundRef.current;
    if (!root) return;

    async function initValidator() {
      if (!root) return;

      resetPlaygroundForm(root);
      setRequiredFields({ ...DEFAULT_REQUIRED_FIELDS });
      setConfigNotice(null);

      const project = projects.find((item) => item.id === selectedProjectId);
      let remote = {};

      if (project?.public_key) {
        try {
          remote = await fetchProjectConfig(project.public_key);
        } catch {
          setConfigNotice(
            "Could not load this project's saved settings. Using built-in defaults until the project is active and reachable.",
          );
        }
      }

      if (cancelled) return;

      const validator = createValidator(remote);
      validator.init(root);
      setValidationModeLabel(
        formatValidationMode(validator.config.validationMode),
      );
    }

    void initValidator();

    return () => {
      cancelled = true;
    };
  }, [projects, selectedProjectId]);

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
        description="Test live validation using the selected project's settings, run markup scans, and save results to the dashboard."
        actions={
          <Link className={styles["header-link"]} href="/dashboard/scans">
            View scans
          </Link>
        }
      />

      <Card className={styles["scan-controls"]}>
        <CardHeader
          title="Project + scan controls"
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
              description="Validation mode, messages, and error colors come from this project's settings."
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
          {projects.length > 0 && (
            <p className={styles["inline-note"]}>
              Active validation mode: <strong>{validationModeLabel}</strong>
            </p>
          )}
          {configNotice && (
            <p className={styles["form-error"]} role="status">
              {configNotice}
            </p>
          )}
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
            <p className={styles["form-intro"]}>
              Name and email are always required. Toggle Required on the other
              fields to test optional validation, then click Test validation to
              see live errors from your selected project settings.
            </p>
            <div ref={playgroundRef}>
              <form
                noValidate
                className={styles["playground-form"]}
                data-keystone-form-id="playground-contact"
              >
                <PlaygroundFormField
                  id="name"
                  label="Name"
                  isRequired
                  alwaysRequired
                >
                  <input name="name" autoComplete="name" />
                </PlaygroundFormField>
                <PlaygroundFormField
                  id="email"
                  label="Email address"
                  isRequired
                  alwaysRequired
                >
                  <input name="email" type="email" autoComplete="email" />
                </PlaygroundFormField>
                <PlaygroundFormField
                  id="phone"
                  label="Phone number"
                  isRequired={requiredFields.phone}
                  onRequiredChange={(isRequired) =>
                    handleRequiredChange("phone", isRequired)
                  }
                >
                  <input name="phone" type="tel" autoComplete="tel" />
                </PlaygroundFormField>
                <PlaygroundFormField
                  id="url"
                  label="Website URL"
                  isRequired={requiredFields.url}
                  onRequiredChange={(isRequired) =>
                    handleRequiredChange("url", isRequired)
                  }
                >
                  <input name="website" type="url" autoComplete="url" />
                </PlaygroundFormField>
                <PlaygroundFormField
                  id="message"
                  label="How can we help?"
                  isRequired={requiredFields.message}
                  onRequiredChange={(isRequired) =>
                    handleRequiredChange("message", isRequired)
                  }
                >
                  <textarea name="message" rows={3} />
                </PlaygroundFormField>
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
