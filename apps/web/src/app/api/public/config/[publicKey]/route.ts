import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  const { publicKey } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_project_configs")
    .select(
      "validation_mode,show_error_summary,focus_error_summary,disable_native_validation,messages",
    )
    .eq("public_key", publicKey)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data)
    return NextResponse.json(
      { error: "Project configuration not found" },
      { status: 404 },
    );
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
