import { type NextRequest, NextResponse } from "next/server";

const ALLOWED_PATTERNS = [
  /^pub-[a-f0-9]+\.r2\.dev$/,
  /^.+\.r2\.cloudflarestorage\.com$/,
];

function isAllowed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_PATTERNS.some((p) => p.test(hostname));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_PARAM",
          message: "Missing 'url' query parameter",
        },
      },
      { status: 400 },
    );
  }

  if (!isAllowed(rawUrl)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "URL hostname not allowed" } },
      { status: 403 },
    );
  }

  try {
    const rangeHeader = request.headers.get("range");
    const upstream = await fetch(rawUrl, {
      headers: rangeHeader ? { Range: rangeHeader } : undefined,
      signal: AbortSignal.timeout(30000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: {
            code: "UPSTREAM_ERROR",
            message: `Audio source returned ${upstream.status}`,
          },
        },
        { status: upstream.status },
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("Content-Type") ?? "audio/mpeg",
    );
    const contentLength = upstream.headers.get("Content-Length");
    if (contentLength) headers.set("Content-Length", contentLength);
    headers.set("Accept-Ranges", "bytes");
    const contentRange = upstream.headers.get("Content-Range");
    if (contentRange) headers.set("Content-Range", contentRange);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return NextResponse.json(
      {
        error: { code: "PROXY_ERROR", message: "Failed to fetch audio source" },
      },
      { status: 502 },
    );
  }
}
