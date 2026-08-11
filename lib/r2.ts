import {
  HeadObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
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
  body: NonNullable<PutObjectCommandInput["Body"]>,
  key: string,
  contentType = "audio/mpeg",
  contentLength?: number,
): Promise<string> {
  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentLength: contentLength,
        ContentType: contentType,
        Metadata: { "accept-ranges": "bytes" },
      }),
    );
    return getPublicUrl(key);
  } catch (error) {
    throw new Error(
      `R2 upload failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function uploadObject(
  body: NonNullable<PutObjectCommandInput["Body"]>,
  key: string,
  contentType: string,
  contentLength?: number,
): Promise<string> {
  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentLength: contentLength,
        ContentType: contentType,
      }),
    );
    return getPublicUrl(key);
  } catch (error) {
    throw new Error(
      `R2 upload failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function getPublicUrl(key: string): string {
  return `${publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function getUploadedAudio(
  key: string,
): Promise<{ exists: boolean; size?: number; contentType?: string }> {
  try {
    const result = await r2.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: key }),
    );
    return {
      exists: true,
      size: result.ContentLength,
      contentType: result.ContentType,
    };
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status === 404) return { exists: false };
    throw new Error("R2 lookup failed");
  }
}

export function getAudioPublicUrl(key: string): string {
  return getPublicUrl(key);
}
