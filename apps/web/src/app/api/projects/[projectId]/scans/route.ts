import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/api/require-user";
import { scanCreateSchema } from "@/lib/validations/scan";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

async function getOwnedProject(
  projectId: string,
  userId: string,
  supabase: SupabaseClient,
) {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function GET(_: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const { supabase, user } = auth;

  try {
    const project = await getOwnedProject(projectId, user.id, supabase);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not verify project." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("scan_results")
    .select(
      "id,project_id,form_identifier,error_count,warning_count,passed_count,results,created_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = scanCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { supabase, user } = auth;

  try {
    const project = await getOwnedProject(projectId, user.id, supabase);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not verify project." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("scan_results")
    .insert({
      project_id: projectId,
      form_identifier: parsed.data.form_identifier ?? null,
      error_count: parsed.data.error_count,
      warning_count: parsed.data.warning_count,
      passed_count: parsed.data.passed_count,
      results: parsed.data.results,
    })
    .select(
      "id,project_id,form_identifier,error_count,warning_count,passed_count,results,created_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save scan." },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
