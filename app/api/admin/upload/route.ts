import { NextRequest, NextResponse } from "next/server";
import { uploadAudio } from "@/lib/r2";
import { requireAdminApi } from "@/lib/auth";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["mp3", "wav", "ogg", "aac", "m4a", "wma"]);

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof Response) return authResult;

  const formData = await request.formData();
  const file = formData.get("audio") as File | null;

  if (!file) {
    return NextResponse.json(
      {
        error: { code: "VALIDATION_ERROR", message: "No audio file provided" },
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "File exceeds 500 MB limit",
        },
      },
      { status: 413 },
    );
  }

  if (!file.type.startsWith("audio/")) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "File must be an audio file",
        },
      },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Audio file is empty",
        },
      },
      { status: 400 },
    );
  }

  const rawExt = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!rawExt || !ALLOWED_EXTENSIONS.has(rawExt)) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `Unsupported file extension "${rawExt}". Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`,
        },
      },
      { status: 400 },
    );
  }
  const key = `lectures/${crypto.randomUUID()}.${rawExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadAudio(buffer, key, file.type);

  return NextResponse.json({ url, key });
}
