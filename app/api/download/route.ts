import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
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

  try {
    const rangeHeader = request.headers.get("range");
    const upstream = await fetch(url, {
      headers: rangeHeader ? { Range: rangeHeader } : undefined,
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
