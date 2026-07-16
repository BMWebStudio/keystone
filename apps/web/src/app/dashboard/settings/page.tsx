import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/forms/FormField";
import styles from "./settings.module.css";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile and default validation behavior for new projects."
        actions={<Button type="button">Save changes</Button>}
      />

      <div className={styles["settings-grid"]}>
        <Card>
          <CardHeader title="Profile" meta={<Badge tone="info">Demo</Badge>} />
          <CardContent>
            <form className={styles["settings-form"]}>
              <FormField
                id="display-name"
                label="Display name"
                description="Shown in the dashboard greeting and shared project views."
              >
                <input
                  name="displayName"
                  defaultValue="Brandon"
                  autoComplete="name"
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
                  defaultValue="brandon@bmwebstudio.com"
                  autoComplete="email"
                  readOnly
                />
              </FormField>
              <Button type="submit">Update profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Default validation"
            meta={<Badge tone="success">New projects</Badge>}
          />
          <CardContent>
            <form className={styles["settings-form"]}>
              <FormField
                id="validation-mode"
                label="Validation mode"
                description="Applied when you create a project. Per-project settings can still override this."
              >
                <select name="validationMode" defaultValue="submit">
                  <option value="submit">Submit only</option>
                  <option value="blur">Blur + submit</option>
                  <option value="change">Change + submit</option>
                </select>
              </FormField>
              <FormField
                id="error-summary"
                label="Error summary"
                description="Show a focused summary when a form has multiple validation errors."
              >
                <select name="showErrorSummary" defaultValue="enabled">
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </FormField>
              <FormField
                id="native-validation"
                label="Browser native validation"
                description="Disable native HTML validation so messages stay consistent and accessible."
              >
                <select name="disableNativeValidation" defaultValue="disabled">
                  <option value="disabled">Disabled (recommended)</option>
                  <option value="enabled">Enabled</option>
                </select>
              </FormField>
              <Button type="submit">Save defaults</Button>
            </form>
          </CardContent>
        </Card>

        <Card className={styles["span-full"]}>
          <CardHeader title="Workspace" />
          <CardContent>
            <dl className={styles["settings-meta"]}>
              <div>
                <dt>Plan</dt>
                <dd>Foundation / demo</dd>
              </div>
              <div>
                <dt>Projects</dt>
                <dd>3 active</dd>
              </div>
              <div>
                <dt>Auth</dt>
                <dd>Connect to Supabase Auth to persist profile changes</dd>
              </div>
            </dl>
            <div className={styles["settings-actions"]}>
              <Button variant="secondary" type="button">
                Export project configs
              </Button>
              <Button variant="danger" type="button">
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
