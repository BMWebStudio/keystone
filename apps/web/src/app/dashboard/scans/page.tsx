import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IssueCard } from "@/components/app/IssueCard";
import { getScansPageData } from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";
import styles from "./scans.module.css";

function formatScanDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ScansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { latestScan, findings, recentScans } = await getScansPageData(
    supabase,
    user.id,
  );

  return (
    <>
      <PageHeader
        eyebrow="Quality"
        title="Scans"
        description="Automated checks for missing labels, ungrouped options, and other broken form patterns across tracked sites."
        actions={
          <Link className={styles["header-action"]} href="/dashboard/playground">
            Run new scan
          </Link>
        }
      />
      <div className={styles["scan-grid"]}>
        <Card>
          <CardHeader
            title="Latest scan"
            meta={
              latestScan ? (
                <Badge tone="info">{latestScan.projectName}</Badge>
              ) : (
                <Badge tone="info">No scans</Badge>
              )
            }
          />
          <CardContent>
            {!latestScan ? (
              <p className={styles["empty-state"]}>
                No scans recorded yet.{" "}
                <Link href="/dashboard/playground">Run a scan in the playground</Link>{" "}
                and save it to a project.
              </p>
            ) : (
              <>
                <p className={styles["scan-timestamp"]}>
                  {formatScanDate(latestScan.created_at)}
                  {latestScan.form_identifier
                    ? ` · ${latestScan.form_identifier}`
                    : ""}
                </p>
                <dl className={styles["scan-meta"]}>
                  <div>
                    <dt>Errors</dt>
                    <dd>{latestScan.error_count}</dd>
                  </div>
                  <div>
                    <dt>Warnings</dt>
                    <dd>{latestScan.warning_count}</dd>
                  </div>
                  <div>
                    <dt>Passed</dt>
                    <dd>{latestScan.passed_count}</dd>
                  </div>
                  <div>
                    <dt>Total checks</dt>
                    <dd>
                      {latestScan.error_count +
                        latestScan.warning_count +
                        latestScan.passed_count}
                    </dd>
                  </div>
                </dl>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Findings" />
          <CardContent>
            {!findings.length ? (
              <p className={styles["empty-state"]}>
                {latestScan
                  ? "This scan did not record any errors or warnings."
                  : "Findings from saved scans will show up here."}
              </p>
            ) : (
              findings.map((issue) => (
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
      </div>
      <Card className={styles["history-card"]}>
        <CardHeader
          title="Recent scans"
          meta={
            recentScans.length ? (
              <Badge tone="info">{recentScans.length}</Badge>
            ) : undefined
          }
        />
        <CardContent>
          {!recentScans.length ? (
            <p className={styles["empty-state"]}>
              No scan history yet.{" "}
              <Link href="/dashboard/projects">Create a project</Link> to get
              started.
            </p>
          ) : (
            <div className={styles["history-list"]}>
              {recentScans.map((scan) => (
                <div className={styles["history-item"]} key={scan.id}>
                  <span>
                    <strong>{scan.projectName}</strong>
                    <small>{formatScanDate(scan.created_at)}</small>
                  </span>
                  <span className={styles["history-counts"]}>
                    <Badge tone={scan.error_count ? "danger" : "success"}>
                      {scan.error_count} errors
                    </Badge>
                    <Badge tone={scan.warning_count ? "warning" : "success"}>
                      {scan.warning_count} warnings
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
