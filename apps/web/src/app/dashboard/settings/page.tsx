import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/forms/FormField";
import { createClient } from "@/lib/supabase/server";
import styles from "./settings.module.css";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile and default validation behavior for new projects."
      />

      <div className={styles["settings-grid"]}>
        <Card>
          <CardHeader title="Profile" />
          <CardContent>
            <ProfileForm
              userId={user.id}
              email={user.email ?? ""}
              initialDisplayName={profile?.display_name ?? ""}
            />
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
              <Button type="button" disabled>
                Save defaults
              </Button>
              <p className={styles["settings-note"]}>
                Default project settings will be saved here in a later update.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className={styles["span-full"]}>
          <CardHeader title="Workspace" />
          <CardContent>
            <dl className={styles["settings-meta"]}>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Projects</dt>
                <dd>{projectCount ?? 0} active</dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
            </dl>
            <div className={styles["settings-actions"]}>
              <SignOutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
