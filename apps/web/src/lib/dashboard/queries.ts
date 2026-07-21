import type { SupabaseClient } from "@supabase/supabase-js";

type ScanIssue = {
  severity: string;
  title: string;
  selector: string;
  message: string;
};

type ScanResultRow = {
  id: string;
  project_id: string;
  form_identifier: string | null;
  error_count: number;
  warning_count: number;
  passed_count: number;
  results: ScanIssue[] | null;
  created_at: string;
};

export type DashboardIssue = {
  severity: "error" | "warning" | "manual";
  title: string;
  selector: string;
  message: string;
};

export type DashboardProject = {
  id: string;
  name: string;
  domain: string | null;
  is_active: boolean;
  latestScan: Pick<
    ScanResultRow,
    "error_count" | "warning_count"
  > | null;
};

export type DashboardOverviewData = {
  displayName: string;
  projects: DashboardProject[];
  recentProjects: DashboardProject[];
  metrics: {
    activeProjects: number;
    openIssues: number;
    checksPassedPercent: number | null;
    eventsToday: number;
  };
  attentionIssues: DashboardIssue[];
};

export type ScansPageData = {
  latestScan: (ScanResultRow & { projectName: string }) | null;
  findings: DashboardIssue[];
  recentScans: Array<
    ScanResultRow & { projectName: string }
  >;
};

function startOfTodayIso() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function normalizeIssue(issue: ScanIssue): DashboardIssue | null {
  if (issue.severity !== "error" && issue.severity !== "warning") {
    return null;
  }

  return {
    severity: issue.severity,
    title: issue.title,
    selector: issue.selector,
    message: issue.message,
  };
}

function flattenIssues(scans: ScanResultRow[], limit: number) {
  const issues: DashboardIssue[] = [];

  for (const scan of scans) {
    const results = Array.isArray(scan.results) ? scan.results : [];
    for (const item of results) {
      const issue = normalizeIssue(item);
      if (!issue) continue;
      issues.push(issue);
      if (issues.length >= limit) return issues;
    }
  }

  return issues;
}

function latestScanByProject(scans: ScanResultRow[]) {
  const map = new Map<string, ScanResultRow>();
  for (const scan of scans) {
    if (!map.has(scan.project_id)) {
      map.set(scan.project_id, scan);
    }
  }
  return map;
}

function aggregateMetrics(latestScans: ScanResultRow[]) {
  let openIssues = 0;
  let totalPassed = 0;
  let totalChecks = 0;

  for (const scan of latestScans) {
    openIssues += scan.error_count + scan.warning_count;
    totalPassed += scan.passed_count;
    totalChecks +=
      scan.error_count + scan.warning_count + scan.passed_count;
  }

  return {
    openIssues,
    checksPassedPercent:
      totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : null,
  };
}

async function fetchUserProjects(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,domain,is_active,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function fetchUserScans(
  supabase: SupabaseClient,
  projectIds: string[],
) {
  if (!projectIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("scan_results")
    .select(
      "id,project_id,form_identifier,error_count,warning_count,passed_count,results,created_at",
    )
    .in("project_id", projectIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ScanResultRow[];
}

export function greetingForHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function resolveDisplayName(
  displayName: string | null | undefined,
  email: string | null | undefined,
) {
  const trimmed = displayName?.trim();
  if (trimmed) return trimmed;

  const localPart = email?.split("@")[0]?.trim();
  return localPart || "there";
}

export function projectStatusBadge(project: DashboardProject) {
  if (!project.latestScan) {
    return { tone: "info" as const, label: "No scans yet" };
  }

  if (project.latestScan.error_count > 0) {
    const count = project.latestScan.error_count;
    return {
      tone: "danger" as const,
      label: `${count} error${count === 1 ? "" : "s"}`,
    };
  }

  if (project.latestScan.warning_count > 0) {
    const count = project.latestScan.warning_count;
    return {
      tone: "warning" as const,
      label: `${count} warning${count === 1 ? "" : "s"}`,
    };
  }

  return { tone: "success" as const, label: "No critical issues" };
}

export async function getDashboardOverviewData(
  supabase: SupabaseClient,
  userId: string,
  email: string | null | undefined,
): Promise<DashboardOverviewData> {
  const [{ data: profile }, projects] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle(),
    fetchUserProjects(supabase, userId),
  ]);

  const projectIds = projects.map((project) => project.id);
  const scans = await fetchUserScans(supabase, projectIds);
  const latestByProject = latestScanByProject(scans);
  const latestScans = [...latestByProject.values()];

  let eventsToday = 0;
  if (projectIds.length) {
    const { count, error } = await supabase
      .from("validation_events")
      .select("id", { count: "exact", head: true })
      .in("project_id", projectIds)
      .gte("created_at", startOfTodayIso());

    if (error) {
      throw new Error(error.message);
    }

    eventsToday = count ?? 0;
  }

  const { openIssues, checksPassedPercent } = aggregateMetrics(latestScans);

  const projectsWithScans: DashboardProject[] = projects.map((project) => {
    const latest = latestByProject.get(project.id);
    return {
      id: project.id,
      name: project.name,
      domain: project.domain,
      is_active: project.is_active,
      latestScan: latest
        ? {
            error_count: latest.error_count,
            warning_count: latest.warning_count,
          }
        : null,
    };
  });

  return {
    displayName: resolveDisplayName(profile?.display_name, email),
    projects: projectsWithScans,
    recentProjects: projectsWithScans.slice(0, 3),
    metrics: {
      activeProjects: projects.filter((project) => project.is_active).length,
      openIssues,
      checksPassedPercent,
      eventsToday,
    },
    attentionIssues: flattenIssues(scans, 3),
  };
}

export async function getScansPageData(
  supabase: SupabaseClient,
  userId: string,
): Promise<ScansPageData> {
  const projects = await fetchUserProjects(supabase, userId);
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );
  const scans = await fetchUserScans(
    supabase,
    projects.map((project) => project.id),
  );

  const withNames = scans.map((scan) => ({
    ...scan,
    projectName: projectNames.get(scan.project_id) ?? "Unknown project",
  }));

  const latestScan = withNames[0] ?? null;

  return {
    latestScan,
    findings: latestScan
      ? flattenIssues([latestScan], 12)
      : [],
    recentScans: withNames.slice(0, 8),
  };
}

export function overviewDescription(data: DashboardOverviewData) {
  if (!data.projects.length) {
    return "Create a project to generate an embed key and start tracking forms.";
  }

  if (data.metrics.openIssues === 0) {
    return "Your tracked projects look healthy. No open scan issues need attention right now.";
  }

  return `${data.metrics.openIssues} open issue${
    data.metrics.openIssues === 1 ? "" : "s"
  } across your latest project scans.`;
}
