import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function jsonError(
  message: string,
  status: number,
  details?: Record<string, string[]>,
): NextResponse<{ error: string; details?: Record<string, string[]> }> {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status },
  );
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, X-Store-Key, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}
