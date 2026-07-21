import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { scanPublicCreateSchema } from "@/lib/validations/scan";
import {
  publicCorsHeaders,
  publicOptionsResponse,
} from "@/lib/api/public-cors";

export async function OPTIONS() {
  return publicOptionsResponse();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = scanPublicCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request." },
      { status: 400, headers: publicCorsHeaders() },
    );
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Server configuration error.",
      },
      { status: 500 },
    );
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("public_key", parsed.data.public_key)
    .eq("is_active", true)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("scan_results")
    .insert({
      project_id: project.id,
      form_identifier: parsed.data.form_identifier ?? null,
      error_count: parsed.data.error_count,
      warning_count: parsed.data.warning_count,
      passed_count: parsed.data.passed_count,
      results: parsed.data.results,
    })
    .select(
      "id,project_id,form_identifier,error_count,warning_count,passed_count,created_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save scan." },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201, headers: publicCorsHeaders() });
}
