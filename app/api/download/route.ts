import { type NextRequest, NextResponse } from "next/server";

function getAllowedHostnames(): string[] {
  const hostnames = ["manhaj.abdurrahman.org"];

  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (r2PublicUrl) {
    try {
      const parsed = new URL(r2PublicUrl);
      hostnames.push(parsed.hostname);
    } catch {
      // ignore invalid URL
    }
  }

  return hostnames;
}

const ALLOWED_HOSTNAMES = getAllowedHostnames();

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

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      {
        error: { code: "INVALID_URL", message: "Invalid URL format" },
      },
      { status: 400 },
    );
  }

  if (!ALLOWED_HOSTNAMES.includes(parsedUrl.hostname)) {
    return NextResponse.json(
      {
        error: { code: "FORBIDDEN", message: "URL hostname not allowed" },
      },
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
        error: {
          code: "PROXY_ERROR",
          message: "Failed to fetch audio source",
        },
      },
      { status: 502 },
    );
  }
}
