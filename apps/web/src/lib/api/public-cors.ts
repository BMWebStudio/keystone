import { NextResponse } from "next/server";

const PUBLIC_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
} as const;

export function publicCorsHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  return { ...PUBLIC_CORS_HEADERS, ...extra };
}

export function publicOptionsResponse() {
  return new NextResponse(null, { status: 204, headers: publicCorsHeaders() });
}
