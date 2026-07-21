import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/require-user";
import { projectCreateSchema } from "@/lib/validations/project";

export async function GET() {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,name,domain,public_key,is_active,created_at,updated_at,project_settings(validation_mode,disable_native_validation)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { supabase, user } = auth;
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      domain: parsed.data.domain ?? null,
    })
    .select("id,name,domain,public_key,is_active,created_at,updated_at")
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message ?? "Could not create project." },
      { status: 500 },
    );
  }

  const { error: settingsError } = await supabase.from("project_settings").insert({
    project_id: project.id,
    validation_mode: "blur",
  });

  if (settingsError) {
    await supabase.from("projects").delete().eq("id", project.id);
    return NextResponse.json(
      { error: settingsError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(project, { status: 201 });
}
