import { redirect } from "next/navigation";
import { PlaygroundPanel } from "@/components/playground/PlaygroundPanel";
import { createClient } from "@/lib/supabase/server";

export default async function PlaygroundPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id,name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return <PlaygroundPanel projects={projects ?? []} />;
}
