import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/app/MetricCard";
import { IssueCard } from "@/components/app/IssueCard";
import {
  getDashboardOverviewData,
  greetingForHour,
  overviewDescription,
  projectStatusBadge,
} from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";
import styles from "./dashboard.module.css";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardOverviewData(
    supabase,
    user.id,
    user.email,
  );

  return (
    <>
      <PageHeader
        eyebrow="Workspace overview"
        title={`${greetingForHour()}, ${data.displayName}.`}
        description={overviewDescription(data)}
        actions={
          <Link className={styles["header-action"]} href="/dashboard/projects">
            Create project
          </Link>
        }
      />
      <section className={styles["metrics-grid"]} aria-label="Project metrics">
        <MetricCard
          label="Active projects"
          value={String(data.metrics.activeProjects)}
          detail={
            data.projects.length
              ? `${data.projects.length} total in workspace`
              : "None yet"
          }
        />
        <MetricCard
          label="Open issues"
          value={String(data.metrics.openIssues)}
          detail={
            data.metrics.openIssues
              ? "From latest scans per project"
              : "No scan issues recorded"
          }
        />
        <MetricCard
          label="Checks passed"
          value={
            data.metrics.checksPassedPercent === null
              ? "—"
              : `${data.metrics.checksPassedPercent}%`
          }
          detail={
            data.metrics.checksPassedPercent === null
              ? "Run scans to calculate pass rate"
              : "Based on latest scan totals"
          }
        />
        <MetricCard
          label="Events today"
          value={String(data.metrics.eventsToday)}
          detail="Validation events across your projects"
        />
      </section>
      <section className={styles["content-grid"]}>
        <Card>
          <CardHeader
            title="Recent projects"
            meta={<Link href="/dashboard/projects">View all</Link>}
          />
          <CardContent>
            {!data.recentProjects.length ? (
              <p className={styles["empty-state"]}>
                No projects yet.{" "}
                <Link href="/dashboard/projects">Create your first project</Link>{" "}
                to get an embed key.
              </p>
            ) : (
              <div className={styles["project-list"]}>
                {data.recentProjects.map((project) => {
                  const status = projectStatusBadge(project);
                  return (
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className={styles["project-item"]}
                      key={project.id}
                    >
                      <span>
                        <strong>{project.name}</strong>
                        <small>
                          {project.domain || "No domain"} ·{" "}
                          {project.is_active ? "Active" : "Inactive"}
                        </small>
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Needs attention"
            meta={
              data.attentionIssues.length ? (
                <Badge tone="warning">
                  {data.attentionIssues.length} item
                  {data.attentionIssues.length === 1 ? "" : "s"}
                </Badge>
              ) : (
                <Badge tone="success">Clear</Badge>
              )
            }
          />
          <CardContent>
            {!data.attentionIssues.length ? (
              <p className={styles["empty-state"]}>
                {data.projects.length
                  ? "No open findings in your latest scans."
                  : "Create a project and record a scan to see findings here."}
              </p>
            ) : (
              data.attentionIssues.map((issue) => (
                <IssueCard
                  key={`${issue.selector}-${issue.title}`}
                  severity={issue.severity}
                  title={issue.title}
                  selector={issue.selector}
                >
                  {issue.message}
                </IssueCard>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
