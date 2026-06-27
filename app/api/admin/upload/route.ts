import { NextRequest, NextResponse } from "next/server";
import { uploadAudio } from "@/lib/r2";
import { requireAdminApi } from "@/lib/auth";

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

  const ext = file.name.split(".").pop() ?? "mp3";
  const key = `lectures/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadAudio(buffer, key, file.type);

  return NextResponse.json({ url, key });
}
