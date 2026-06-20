import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    // biome-ignore lint/style/noNonNullAssertion: env vars guaranteed at runtime
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    // biome-ignore lint/style/noNonNullAssertion: env vars guaranteed at runtime
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadAudio(
  buffer: Buffer,
  key: string,
  contentType = "audio/mpeg",
): Promise<string> {
  try {
    await r2.send(
      new PutObjectCommand({
        // biome-ignore lint/style/noNonNullAssertion: env vars guaranteed at runtime
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: { "accept-ranges": "bytes" },
      }),
    );
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    throw new Error(
      `R2 upload failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
