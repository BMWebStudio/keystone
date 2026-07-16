import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./project.module.css";
export default function ProjectPage() {
  const snippet = `<script\n  src="https://app.example.com/validator/a11y-validator.min.js"\n  data-a11y-project="proj_demo_123"\n  defer\n></script>`;
  return (
    <>
      <PageHeader
        eyebrow="Project"
        title="MassCOSH website"
        description="Configure validation behavior, review forms, and install the standalone validator."
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
              Add the script before the closing body tag. The public project key
              exposes configuration only—not account data.
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
