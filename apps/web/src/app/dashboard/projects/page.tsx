import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import styles from "./projects.module.css";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id,name,domain,public_key,is_active,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Each project gets a public key and drop-in script that tracks forms on any HTML site."
      />

      <div className={styles["projects-layout"]}>
        <Card>
          <CardHeader title="Create project" />
          <CardContent>
            <CreateProjectForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="All projects"
            meta={<Badge tone="info">{projects?.length ?? 0}</Badge>}
          />
          <CardContent>
            {!projects?.length ? (
              <p className={styles["empty-state"]}>
                No projects yet. Create one to generate an embed key.
              </p>
            ) : (
              <div className={styles["project-list"]}>
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className={styles["project-item"]}
                  >
                    <span>
                      <strong>{project.name}</strong>
                      <small>
                        {project.domain || "No domain"} · {project.public_key}
                      </small>
                    </span>
                    <Badge tone={project.is_active ? "success" : "warning"}>
                      {project.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
