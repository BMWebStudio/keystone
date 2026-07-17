import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./projects.module.css";

const projects = [
  {
    id: "demo",
    name: "MassCOSH website",
    domain: "masscosh.org",
    forms: 3,
    status: "warning" as const,
    statusLabel: "4 open issues",
  },
  {
    id: "demo",
    name: "BM Web Studio",
    domain: "bmwebstudio.com",
    forms: 2,
    status: "success" as const,
    statusLabel: "No critical issues",
  },
  {
    id: "demo",
    name: "Demo checkout",
    domain: "localhost",
    forms: 2,
    status: "danger" as const,
    statusLabel: "1 error",
  },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Each project gets a public key and drop-in script that tracks forms on any HTML site."
        actions={<Button type="button">Create project</Button>}
      />
      <Card>
        <CardHeader title="All projects" meta={<Badge tone="info">3</Badge>} />
        <CardContent>
          <div className={styles["project-list"]}>
            {projects.map((project) => (
              <Link
                key={`${project.name}-${project.domain}`}
                href={`/dashboard/projects/${project.id}`}
                className={styles["project-item"]}
              >
                <span>
                  <strong>{project.name}</strong>
                  <small>
                    {project.domain} · {project.forms} forms
                  </small>
                </span>
                <Badge tone={project.status}>{project.statusLabel}</Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
