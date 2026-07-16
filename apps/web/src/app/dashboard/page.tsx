import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/app/MetricCard";
import { IssueCard } from "@/components/app/IssueCard";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace overview"
        title="Good evening, Brandon."
        description="Your forms are in good shape. Three items need attention before your next release."
        actions={<Button>Create project</Button>}
      />
      <section className={styles["metrics-grid"]} aria-label="Project metrics">
        <MetricCard label="Active projects" value="3" detail="Across 7 forms" />
        <MetricCard
          label="Open issues"
          value="5"
          detail="2 errors, 3 warnings"
        />
        <MetricCard
          label="Checks passed"
          value="94%"
          detail="Up 8% this week"
        />
        <MetricCard
          label="Events today"
          value="128"
          detail="No sensitive values stored"
        />
      </section>
      <section className={styles["content-grid"]}>
        <Card>
          <CardHeader
            title="Recent projects"
            meta={<Link href="/dashboard/projects">View all</Link>}
          />
          <CardContent>
            <div className={styles["project-list"]}>
              {[
                ["MassCOSH", "masscosh.org", "3 forms", "warning", "4 issues"],
                [
                  "BM Web Studio",
                  "bmwebstudio.com",
                  "2 forms",
                  "success",
                  "No critical issues",
                ],
                ["Demo checkout", "localhost", "2 forms", "danger", "1 error"],
              ].map(([name, domain, forms, tone, status]) => (
                <Link
                  href="/dashboard/projects/demo"
                  className={styles["project-item"]}
                  key={name}
                >
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {domain} · {forms}
                    </small>
                  </span>
                  <Badge tone={tone as "warning" | "success" | "danger"}>
                    {status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Needs attention"
            meta={<Badge tone="warning">3 items</Badge>}
          />
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
              severity="manual"
              title="Confirm instructions are understandable"
              selector="#contact-form"
            >
              Automated checks cannot determine whether the helper copy is clear
              enough.
            </IssueCard>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
