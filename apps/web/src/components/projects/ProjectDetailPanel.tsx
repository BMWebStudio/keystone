"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import formFieldStyles from "@/components/forms/FormField.module.css";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import styles from "./projects-forms.module.css";
import detailStyles from "@/app/dashboard/projects/[projectId]/project.module.css";
import {
  DEFAULT_VALIDATION_MESSAGES,
  mergeValidationMessages,
  PROJECT_SETTINGS_MESSAGE_DESCRIPTIONS,
  PROJECT_SETTINGS_MESSAGE_KEYS,
  PROJECT_SETTINGS_MESSAGE_LABELS,
  serializeProjectSettingsMessages,
  type ValidationMessages,
} from "@/lib/validations/messages";
import {
  applyBackgroundColorChange,
  DEFAULT_ERROR_FIELD_COLORS,
  ERROR_FIELD_TEXT_COLOR,
  mergeErrorFieldColors,
  serializeErrorFieldColors,
  validateErrorFieldContrast,
  WCAG_AA_CONTRAST_MIN,
  type ErrorFieldColors,
} from "@/lib/validations/error-colors";
import {
  evaluateContrast,
  formatContrastRatio,
} from "@/lib/a11y/contrast";

type ProjectSettings = {
  validation_mode: string;
  show_error_summary: boolean;
  disable_native_validation: boolean;
  messages?: ValidationMessages | null;
  error_colors?: Partial<ErrorFieldColors> | null;
};

export type ProjectDetailData = {
  id: string;
  name: string;
  domain: string | null;
  public_key: string;
  is_active: boolean;
  project_settings: ProjectSettings | ProjectSettings[] | null;
};

function normalizeValidationMode(mode: string): "submit" | "blur" {
  return mode === "submit" ? "submit" : "blur";
}

function getSettings(
  settings: ProjectSettings | ProjectSettings[] | null,
): ProjectSettings {
  if (Array.isArray(settings)) {
    return settings[0] ?? {
      validation_mode: "blur",
      show_error_summary: true,
      disable_native_validation: true,
    };
  }

  return (
    settings ?? {
      validation_mode: "blur",
      show_error_summary: true,
      disable_native_validation: true,
    }
  );
}

function ContrastStatus({ background }: { background: string }) {
  const result = evaluateContrast(ERROR_FIELD_TEXT_COLOR, background);
  if (!result) return null;

  return (
    <p
      className={
        result.passes ? styles["contrast-pass"] : styles["contrast-fail"]
      }
      role="status"
    >
      {formatContrastRatio(result.ratio)} —{" "}
      {result.passes
        ? `Passes WCAG AA (${WCAG_AA_CONTRAST_MIN}:1 minimum)`
        : `Below WCAG AA ${WCAG_AA_CONTRAST_MIN}:1 minimum`}
    </p>
  );
}

export function ProjectDetailPanel({ project }: { project: ProjectDetailData }) {
  const router = useRouter();
  const settings = getSettings(project.project_settings);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://keystone-web-tmld.vercel.app";
  const snippet = `<script
  src="${appUrl}/keystone/validator.js"
  data-keystone-project="${project.public_key}"
  defer
></script>`;

  const [name, setName] = useState(project.name);
  const [domain, setDomain] = useState(project.domain ?? "");
  const [validationMode, setValidationMode] = useState(
    normalizeValidationMode(settings.validation_mode),
  );
  const [showErrorSummary, setShowErrorSummary] = useState(
    settings.show_error_summary ? "enabled" : "disabled",
  );
  const [disableNativeValidation, setDisableNativeValidation] = useState(
    settings.disable_native_validation ? "disabled" : "enabled",
  );
  const [messages, setMessages] = useState(() =>
    mergeValidationMessages(settings.messages),
  );
  const [errorColors, setErrorColors] = useState(() =>
    mergeErrorFieldColors(settings.error_colors),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const nextSettings = getSettings(project.project_settings);
    setName(project.name);
    setDomain(project.domain ?? "");
    setValidationMode(normalizeValidationMode(nextSettings.validation_mode));
    setShowErrorSummary(
      nextSettings.show_error_summary ? "enabled" : "disabled",
    );
    setDisableNativeValidation(
      nextSettings.disable_native_validation ? "disabled" : "enabled",
    );
    setMessages(mergeValidationMessages(nextSettings.messages));
    setErrorColors(mergeErrorFieldColors(nextSettings.error_colors));
  }, [project]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Project name is required.");
      return;
    }

    const contrastError = validateErrorFieldContrast(errorColors);
    if (contrastError) {
      setFormError(contrastError);
      return;
    }

    setIsSaving(true);

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        domain: domain.trim() || null,
        validation_mode: validationMode,
        show_error_summary: showErrorSummary === "enabled",
        disable_native_validation: disableNativeValidation === "disabled",
        messages: serializeProjectSettingsMessages(messages),
        error_colors: serializeErrorFieldColors(errorColors),
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setFormError(payload.error ?? "Could not update project.");
      setIsSaving(false);
      return;
    }

    setSuccessMessage("Project updated.");
    setIsSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    setFormError(null);
    setIsDeleting(true);

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setFormError(payload.error ?? "Could not delete project.");
      setIsDeleting(false);
      setConfirmDelete(false);
      return;
    }

    router.push("/dashboard/projects");
    router.refresh();
  }

  async function handleCopySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyMessage("Snippet copied.");
    } catch {
      setCopyMessage("Could not copy snippet.");
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

      <form className={detailStyles["project-layout"]} onSubmit={handleSave}>
        <div className={detailStyles["project-grid-top"]}>
          <Card>
            <CardHeader
              title="Project details"
              meta={
                <Badge tone={project.is_active ? "success" : "warning"}>
                  {project.is_active ? "Active" : "Inactive"}
                </Badge>
              }
            />
            <CardContent>
              <div className={styles["project-form"]}>
                <FormField id="edit-name" label="Project name" required>
                  <input
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </FormField>
                <FormField id="edit-domain" label="Domain">
                  <input
                    name="domain"
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                  />
                </FormField>
                <FormField id="edit-validation-mode" label="Validation mode">
                  <select
                    name="validationMode"
                    value={validationMode}
                    onChange={(event) =>
                      setValidationMode(
                        normalizeValidationMode(event.target.value),
                      )
                    }
                  >
                    <option value="submit">Submit only</option>
                    <option value="blur">Blur + submit (Recommended)</option>
                  </select>
                </FormField>
                <FormField id="edit-error-summary" label="Error summary">
                  <select
                    name="showErrorSummary"
                    value={showErrorSummary}
                    onChange={(event) => setShowErrorSummary(event.target.value)}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </FormField>
                <FormField
                  id="edit-native-validation"
                  label="Browser native validation"
                >
                  <select
                    name="disableNativeValidation"
                    value={disableNativeValidation}
                    onChange={(event) =>
                      setDisableNativeValidation(event.target.value)
                    }
                  >
                    <option value="disabled">Disabled (recommended)</option>
                    <option value="enabled">Enabled</option>
                  </select>
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Installation" />
            <CardContent>
              <p>
                Add the script before the closing body tag. It discovers every
                form on the page and loads settings from your public project key.
              </p>
              <dl>
                <div>
                  <dt>Public key</dt>
                  <dd>{project.public_key}</dd>
                </div>
              </dl>
              <pre>
                <code>{snippet}</code>
              </pre>
              <Button size="sm" type="button" onClick={handleCopySnippet}>
                Copy snippet
              </Button>
              {copyMessage && (
                <p className={styles["copy-success"]} role="status">
                  {copyMessage}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader title="Validation messages" />
          <CardContent>
            <p className={styles["message-fieldset-note"]}>
              Default copy for every form using this project key. Override
              individual fields in markup with{" "}
              <code>data-keystone-message-required</code>,{" "}
              <code>data-keystone-message-email</code>, and similar attributes.
              Legacy <code>data-a11y-message-*</code> attributes are still
              supported.
            </p>
            <p className={styles["message-fieldset-note"]}>
              For custom formats, add a <code>pattern</code> attribute on the
              field and set{" "}
              <code>data-keystone-message-pattern=&quot;Your message here&quot;</code>{" "}
              on that same input. Pattern messages are field-specific, so you do
              not need a project setting for them. If no field message is set,
              the validator uses the built-in fallback: &quot;
              {DEFAULT_VALIDATION_MESSAGES.pattern}&quot;
            </p>
            <div className={styles["message-fields"]}>
              {PROJECT_SETTINGS_MESSAGE_KEYS.map((key) => (
                <FormField
                  key={key}
                  id={`message-${key}`}
                  label={PROJECT_SETTINGS_MESSAGE_LABELS[key]}
                  description={PROJECT_SETTINGS_MESSAGE_DESCRIPTIONS[key]}
                >
                  <input
                    name={`message-${key}`}
                    value={messages[key]}
                    onChange={(event) =>
                      setMessages((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder={DEFAULT_VALIDATION_MESSAGES[key]}
                  />
                </FormField>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Error field colors" />
          <CardContent>
            <p className={styles["message-fieldset-note"]}>
              Customize the background colors applied to invalid fields on your
              site. Both colors are checked against the validator field text
              color (<code>{ERROR_FIELD_TEXT_COLOR}</code>) and must meet or
              exceed WCAG AA contrast of {WCAG_AA_CONTRAST_MIN}:1. Border,
              message text, and summary colors stay on the accessible default
              palette.
            </p>
            <div className={styles["color-settings-layout"]}>
              <div className={styles["color-controls"]}>
                <div className={formFieldStyles["form-field"]}>
                  <label htmlFor="error-field-background">
                    Invalid field background
                  </label>
                  <div className={styles["color-input-row"]}>
                    <input
                      type="color"
                      className={styles["color-picker"]}
                      value={errorColors.field_background}
                      onChange={(event) =>
                        setErrorColors((current) =>
                          applyBackgroundColorChange(
                            current,
                            event.target.value,
                          ),
                        )
                      }
                      aria-label="Invalid field background color"
                    />
                    <input
                      id="error-field-background"
                      name="errorFieldBackground"
                      value={errorColors.field_background}
                      onChange={(event) =>
                        setErrorColors((current) =>
                          applyBackgroundColorChange(
                            current,
                            event.target.value,
                          ),
                        )
                      }
                      placeholder={DEFAULT_ERROR_FIELD_COLORS.field_background}
                    />
                  </div>
                  <ContrastStatus background={errorColors.field_background} />
                </div>
                <div className={formFieldStyles["form-field"]}>
                  <label htmlFor="error-field-background-focus">
                    Invalid field focus background
                  </label>
                  <div className={styles["color-input-row"]}>
                    <input
                      type="color"
                      className={styles["color-picker"]}
                      value={errorColors.field_background_focus}
                      onChange={(event) =>
                        setErrorColors((current) => ({
                          ...current,
                          field_background_focus: event.target.value,
                        }))
                      }
                      aria-label="Invalid field focus background color"
                    />
                    <input
                      id="error-field-background-focus"
                      name="errorFieldBackgroundFocus"
                      value={errorColors.field_background_focus}
                      onChange={(event) =>
                        setErrorColors((current) => ({
                          ...current,
                          field_background_focus: event.target.value,
                        }))
                      }
                      placeholder={
                        DEFAULT_ERROR_FIELD_COLORS.field_background_focus
                      }
                    />
                  </div>
                  <ContrastStatus
                    background={errorColors.field_background_focus}
                  />
                  <p className={styles["color-sync-note"]}>
                    Focus background updates automatically when you change the
                    base background so it stays distinguishable and meets
                    contrast. You can still override it manually.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setErrorColors(
                      mergeErrorFieldColors(DEFAULT_ERROR_FIELD_COLORS),
                    )
                  }
                >
                  Reset to defaults
                </Button>
              </div>
              <div className={styles["color-preview"]}>
                <p className={styles["color-preview-label"]}>Preview</p>
                <input
                  className={styles["color-preview-field"]}
                  aria-invalid="true"
                  readOnly
                  value="Invalid field example"
                  style={{
                    backgroundColor: errorColors.field_background,
                    borderColor: "var(--danger-border)",
                    boxShadow: "0 0 0 1px var(--danger-border)",
                    color: ERROR_FIELD_TEXT_COLOR,
                  }}
                />
                <input
                  className={`${styles["color-preview-field"]} ${styles["color-preview-field-focus"]}`}
                  aria-invalid="true"
                  readOnly
                  value="Invalid field focus example"
                  style={{
                    backgroundColor: errorColors.field_background_focus,
                    borderColor: "var(--danger-border-focus)",
                    boxShadow: "0 0 0 1px var(--danger-border-focus)",
                    outline: "3px solid var(--danger-border-focus)",
                    outlineOffset: "2px",
                    color: ERROR_FIELD_TEXT_COLOR,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={styles["form-actions-row"]}>
          <Button type="submit" isLoading={isSaving}>
            Save changes
          </Button>
          {!confirmDelete ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirmDelete(true)}
            >
              Delete project
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                onClick={handleDelete}
              >
                Confirm delete
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>
    </>
  );
}
