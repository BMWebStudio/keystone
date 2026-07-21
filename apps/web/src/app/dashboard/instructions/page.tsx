import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  DEFAULT_VALIDATION_MESSAGES,
  PROJECT_SETTINGS_MESSAGE_LABELS,
  PROJECT_SETTINGS_MESSAGE_KEYS,
} from "@/lib/validations/messages";
import { WCAG_AA_CONTRAST_MIN } from "@/lib/validations/error-colors";
import { createClient } from "@/lib/supabase/server";
import styles from "./instructions.module.css";

export default async function InstructionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://keystone-web-tmld.vercel.app";

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Instructions"
        description="Install Keystone, configure project defaults, and override validation copy or colors in HTML when you need field-level control."
      />

      <div className={styles.sections}>
        <Card>
          <CardHeader title="Install the script" />
          <CardContent>
            <p>
              Add the validator before the closing <code>&lt;/body&gt;</code> tag
              on any site where forms should be tracked. Use the public key from
              your project&apos;s Installation panel.
            </p>
            <pre>
              <code>{`<script
  src="${appUrl}/keystone/validator.js"
  data-keystone-project="proj_your_public_key"
  defer
></script>`}</code>
            </pre>
            <p>
              Keystone discovers forms automatically, loads settings from your
              dashboard, and injects accessible inline errors next to invalid
              fields.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Validation messages" />
          <CardContent>
            <p>
              Project settings define default copy for every form using that
              project key. Override individual fields in markup with{" "}
              <code>data-keystone-message-required</code>,{" "}
              <code>data-keystone-message-email</code>, and similar attributes.
              Legacy <code>data-a11y-message-*</code> attributes are still
              supported.
            </p>
            <p>
              For custom formats, add a <code>pattern</code> attribute on the
              field and set{" "}
              <code>
                data-keystone-message-pattern=&quot;Your message here&quot;
              </code>{" "}
              on that same input. Pattern messages are field-specific, so you do
              not need a project setting for them. If no field message is set,
              the validator uses the built-in fallback: &quot;
              {DEFAULT_VALIDATION_MESSAGES.pattern}&quot;
            </p>
            <ul className={styles["message-list"]}>
              {PROJECT_SETTINGS_MESSAGE_KEYS.map((key) => (
                <li key={key}>
                  <strong>{PROJECT_SETTINGS_MESSAGE_LABELS[key]}</strong>
                  <span>{DEFAULT_VALIDATION_MESSAGES[key]}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Error field colors" />
          <CardContent>
            <p>
              Customize the background and text colors applied to invalid fields
              on your site. When you change a background, Keystone recommends a
              text color that meets WCAG AA contrast of {WCAG_AA_CONTRAST_MIN}:1
              against both the default and focus backgrounds. You can override
              the text color in project settings and preview the result before
              saving.
            </p>
            <p>
              Focus background updates automatically when you change the base
              background so invalid fields stay distinguishable in keyboard
              focus. You can still override focus background manually.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Data attributes" />
          <CardContent>
            <p>
              Use <code>data-keystone-ignore-form</code> to skip a form,{" "}
              <code>data-keystone-ignore</code> to skip one field, and{" "}
              <code>data-keystone-form-id</code> to label scans in the
              dashboard. See the repository docs for the full attribute
              reference.
            </p>
            <p>
              Full attribute reference lives in{" "}
              <code>docs/data-attributes.md</code> in the project repository.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
