import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/require-user";
import { validateErrorFieldContrast } from "@/lib/validations/error-colors";
import { sanitizeIncomingMessages } from "@/lib/validations/messages";
import { projectUpdateSchema } from "@/lib/validations/project";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,name,domain,public_key,is_active,created_at,updated_at,project_settings(validation_mode,disable_native_validation,messages,error_colors)",
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteContext) {
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

  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  if (parsed.data.error_colors !== undefined) {
    const contrastError = validateErrorFieldContrast(parsed.data.error_colors);
    if (contrastError) {
      return NextResponse.json({ error: contrastError }, { status: 400 });
    }
  }

  const { supabase, user } = auth;
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const projectFields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.name !== undefined) projectFields.name = parsed.data.name;
  if (parsed.data.domain !== undefined) projectFields.domain = parsed.data.domain;
  if (parsed.data.is_active !== undefined) {
    projectFields.is_active = parsed.data.is_active;
  }

  const { error: projectError } = await supabase
    .from("projects")
    .update(projectFields)
    .eq("id", projectId);

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  const settingsFields: Record<string, unknown> = {};
  if (parsed.data.validation_mode !== undefined) {
    settingsFields.validation_mode = parsed.data.validation_mode;
  }
  if (parsed.data.disable_native_validation !== undefined) {
    settingsFields.disable_native_validation =
      parsed.data.disable_native_validation;
  }
  if (parsed.data.messages !== undefined) {
    settingsFields.messages = sanitizeIncomingMessages(parsed.data.messages);
  }
  if (parsed.data.error_colors !== undefined) {
    settingsFields.error_colors = parsed.data.error_colors;
  }

  if (Object.keys(settingsFields).length > 0) {
    const { error: settingsError } = await supabase
      .from("project_settings")
      .update(settingsFields)
      .eq("project_id", projectId);

    if (settingsError) {
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,name,domain,public_key,is_active,created_at,updated_at,project_settings(validation_mode,disable_native_validation,messages,error_colors)",
    )
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not load updated project." },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Project deleted." });
}
