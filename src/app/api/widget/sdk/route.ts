import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "widget",
      "checkout-optimizer.sdk.js",
    );
    let source = await readFile(filePath, "utf8");

    if (key) {
      source = `${source}\n;/* store key: ${key} */`;
    }

    return new NextResponse(source, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse(
      "/* Checkout Optimizer SDK not built. Run: npm run build:widget */",
      {
        status: 503,
        headers: { "Content-Type": "application/javascript" },
      },
    );
  }
}
