import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./project.module.css";

export default function ProjectPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const snippet = `<script
  src="${appUrl}/validator/a11y-validator.js"
  data-a11y-project="proj_demo_123"
  defer
></script>`;

  return (
    <>
      <PageHeader
        eyebrow="Project"
        title="MassCOSH website"
        description="Configure validation behavior, review forms, and install the standalone validator on any HTML site."
        actions={<Button variant="secondary">Run scan</Button>}
      />
      <div className={styles["project-grid"]}>
        <Card>
          <CardHeader
            title="Project status"
            meta={<Badge tone="success">Active</Badge>}
          />
          <CardContent>
            <dl>
              <div>
                <dt>Domain</dt>
                <dd>masscosh.org</dd>
              </div>
              <div>
                <dt>Forms detected</dt>
                <dd>3</dd>
              </div>
              <div>
                <dt>Validation mode</dt>
                <dd>Submit + blur</dd>
              </div>
              <div>
                <dt>Error summary</dt>
                <dd>Enabled</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Installation" />
          <CardContent>
            <p>
              Add the script before the closing body tag. It discovers every
              form on the page, validates fields, and scans for missing labels
              and other broken patterns. The public project key exposes
              configuration only—not account data.
            </p>
            <pre>
              <code>{snippet}</code>
            </pre>
            <Button size="sm">Copy snippet</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
