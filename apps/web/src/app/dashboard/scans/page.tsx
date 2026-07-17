import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IssueCard } from "@/components/app/IssueCard";
import styles from "./scans.module.css";

export default function ScansPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quality"
        title="Scans"
        description="Automated checks for missing labels, ungrouped options, and other broken form patterns across tracked sites."
        actions={<Button type="button">Run new scan</Button>}
      />
      <div className={styles["scan-grid"]}>
        <Card>
          <CardHeader
            title="Latest scan"
            meta={<Badge tone="warning">MassCOSH</Badge>}
          />
          <CardContent>
            <dl className={styles["scan-meta"]}>
              <div>
                <dt>Forms checked</dt>
                <dd>3</dd>
              </div>
              <div>
                <dt>Errors</dt>
                <dd>1</dd>
              </div>
              <div>
                <dt>Warnings</dt>
                <dd>2</dd>
              </div>
              <div>
                <dt>Passed</dt>
                <dd>8</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Findings" />
          <CardContent>
            <IssueCard
              severity="error"
              title="Email input has no accessible label"
              selector="#newsletter-email"
            >
              Add a visible label or a programmatically associated accessible
              name.
            </IssueCard>
            <IssueCard
              severity="warning"
              title="Radio options are not grouped"
              selector="[name='format']"
            >
              Wrap related choices in a fieldset and describe them with a
              legend.
            </IssueCard>
            <IssueCard
              severity="passed"
              title="Contact form fields are labeled"
              selector="#contact-form"
            >
              Every control in this form has an accessible name.
            </IssueCard>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
