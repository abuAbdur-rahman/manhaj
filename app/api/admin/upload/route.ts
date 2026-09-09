import { type NextRequest, NextResponse } from "next/server";
import {
  claimOperation,
  completeOperation,
  failOperation,
  getOperationId,
  requestHash,
} from "@/lib/admin-operations";
import { getAudioDuration } from "@/lib/audio";
import { requireAdminApi } from "@/lib/auth";
import { getAudioPublicUrl, getUploadedAudio, uploadAudio } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 200 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "mp3",
  "wav",
  "ogg",
  "aac",
  "m4a",
  "wma",
  "mpeg",
  "opus",
  "oga",
]);

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof Response) return authResult;
  const admin = authResult;
  const operationId = getOperationId(request);
  if (operationId instanceof Response) return operationId;

  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_FILE_SIZE + 64 * 1024
  ) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "File exceeds 200 MB limit",
        },
      },
      { status: 413 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_FORM_DATA", message: "Malformed form data" } },
      { status: 400 },
    );
  }

  const entry = formData.get("audio");
  if (!(entry instanceof File)) {
    return NextResponse.json(
      {
        error: { code: "VALIDATION_ERROR", message: "No audio file provided" },
      },
      { status: 400 },
    );
  }
  const file = entry;

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "File exceeds 200 MB limit",
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
          message: "Unsupported file type; audio file expected",
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
  const requestedScholar = formData.get("scholar_id");
  const scholarId =
    admin.role === "scholar_admin"
      ? admin.scholarId
      : typeof requestedScholar === "string"
        ? requestedScholar
        : null;
  if (!scholarId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Scholar is required" } },
      { status: 422 },
    );
  }
  if (
    admin.role === "scholar_admin" &&
    typeof requestedScholar === "string" &&
    requestedScholar !== admin.scholarId
  ) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Upload is outside your scholar scope",
        },
      },
      { status: 403 },
    );
  }
  const supabase = createAdminClient();
  const { data: scholar } = await supabase
    .from("scholars")
    .select("id")
    .eq("id", scholarId)
    .maybeSingle();
  if (!scholar) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Scholar not found" } },
      { status: 404 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const durationSeconds = await getAudioDuration(bytes);

  const fingerprint = requestHash({
    scholarId,
    name: file.name,
    size: file.size,
    type: file.type,
    extension: rawExt,
  });
  const claim = await claimOperation(supabase, {
    id: operationId,
    adminId: admin.id,
    scholarId,
    operationType: "upload",
    requestHash: fingerprint,
  });
  if (claim instanceof Response) return claim;
  if (claim.status === "completed") {
    return NextResponse.json({
      url: claim.object_url,
      key: claim.object_key,
      duration_seconds: durationSeconds,
    });
  }
  const key = `lectures/${scholarId}/${admin.id}/${operationId}.${rawExt}`;
  const url = getAudioPublicUrl(key);

  try {
    const existing = await getUploadedAudio(key);
    if (existing.exists) {
      if (existing.size !== file.size || existing.contentType !== file.type) {
        throw new Error("Recovered upload metadata does not match request");
      }
    } else {
      await uploadAudio(file, key, file.type, file.size);
    }
  } catch (error) {
    console.error("Audio upload failed:", error);
    await failOperation(supabase, {
      id: operationId,
      adminId: admin.id,
      claimToken: claim.claim_token,
    }).catch((failure) =>
      console.error("Failed to release upload operation:", failure),
    );
    return NextResponse.json(
      {
        error: {
          code: "UPLOAD_FAILED",
          message: "Audio upload failed. Retry the upload.",
        },
      },
      { status: 502 },
    );
  }

  try {
    await completeOperation(supabase, {
      id: operationId,
      adminId: admin.id,
      claimToken: claim.claim_token,
      objectKey: key,
      objectUrl: url,
      fileSizeBytes: file.size,
      contentType: file.type,
      fileExtension: rawExt,
      responseBody: { url, key, duration_seconds: durationSeconds },
    });
  } catch (error) {
    console.error("Failed to record completed upload:", error);
    await failOperation(supabase, {
      id: operationId,
      adminId: admin.id,
      claimToken: claim.claim_token,
    }).catch((failure) =>
      console.error("Failed to release upload operation for retry:", failure),
    );
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "Upload completed but could not be recorded; retry with the same operation ID",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ url, key, duration_seconds: durationSeconds });
}
