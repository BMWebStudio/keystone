import { notFound, redirect } from "next/navigation";
import {
  ProjectDetailPanel,
  type ProjectDetailData,
} from "@/components/projects/ProjectDetailPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: RouteContext) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id,name,domain,public_key,is_active,project_settings(validation_mode,show_error_summary,disable_native_validation,messages,error_colors)",
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description="Configure validation behavior and copy the embed script for any HTML site."
      />
      <ProjectDetailPanel project={project as ProjectDetailData} />
    </>
  );
}
