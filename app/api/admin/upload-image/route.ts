import { type NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { uploadObject } from "@/lib/r2";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sniffImageType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi("super_admin");
  if (authResult instanceof Response) return authResult;

  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_IMAGE_SIZE + 64 * 1024
  ) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Image must be between 1 byte and 5 MB",
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

  const entry = formData.get("image");
  if (!(entry instanceof File)) {
    return NextResponse.json(
      {
        error: { code: "VALIDATION_ERROR", message: "No image file provided" },
      },
      { status: 400 },
    );
  }
  if (entry.size === 0 || entry.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Image must be between 1 byte and 5 MB",
        },
      },
      { status: 413 },
    );
  }
  if (!ALLOWED_TYPES.has(entry.type)) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Only JPEG, PNG, and WebP images are supported",
        },
      },
      { status: 400 },
    );
  }

  const magicBytes = new Uint8Array(await entry.slice(0, 12).arrayBuffer());
  const sniffedType = sniffImageType(magicBytes);
  if (sniffedType !== entry.type) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "File content does not match its declared image type",
        },
      },
      { status: 400 },
    );
  }

  const extension = entry.type.split("/")[1].replace("jpeg", "jpg");
  const key = `scholars/${authResult.id}/${crypto.randomUUID()}.${extension}`;
  try {
    const url = await uploadObject(entry, key, entry.type, entry.size);
    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Scholar image upload failed:", error);
    return NextResponse.json(
      { error: { code: "UPLOAD_FAILED", message: "Image upload failed" } },
      { status: 502 },
    );
  }
}
