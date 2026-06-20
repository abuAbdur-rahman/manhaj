import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "./utils";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${requireEnv("CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});

const publicUrl = requireEnv("NEXT_PUBLIC_R2_PUBLIC_URL");
const bucketName = requireEnv("R2_BUCKET_NAME");

export async function uploadAudio(
  buffer: Buffer,
  key: string,
  contentType = "audio/mpeg",
): Promise<string> {
  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: { "accept-ranges": "bytes" },
      }),
    );
    return `${publicUrl}/${encodeURIComponent(key)}`;
  } catch (error) {
    throw new Error(
      `R2 upload failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
