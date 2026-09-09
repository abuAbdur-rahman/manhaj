import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

interface RpcClient {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

export function getOperationId(request: Request): string | Response {
  const value = request.headers.get("x-operation-id");
  if (
    !value ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_OPERATION_ID",
          message: "A UUID X-Operation-ID header is required",
        },
      },
      { status: 400 },
    );
  }
  return value;
}

export function requestHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function idempotencyConflict(): Response {
  return NextResponse.json(
    {
      error: {
        code: "IDEMPOTENCY_CONFLICT",
        message: "Operation ID was already used for different input",
      },
    },
    { status: 409 },
  );
}

export interface ClaimedOperation {
  acquired: boolean;
  admin_id: string;
  scholar_id: string | null;
  operation_type: string;
  request_hash: string;
  status: "pending" | "completed" | "failed";
  resource_id: string | null;
  object_url: string | null;
  object_key: string | null;
  claim_token: string;
}

export async function claimOperation(
  supabase: {
    rpc: (
      name: string,
      args: Record<string, unknown>,
    ) => PromiseLike<{
      data: ClaimedOperation[] | null;
      error: { message: string } | null;
    }>;
  },
  input: {
    id: string;
    adminId: string;
    scholarId: string;
    operationType: string;
    requestHash: string;
    resourceId?: string;
  },
): Promise<ClaimedOperation | Response> {
  const { data, error } = await supabase.rpc("claim_episode_operation", {
    p_id: input.id,
    p_admin_id: input.adminId,
    p_scholar_id: input.scholarId,
    p_operation_type: input.operationType,
    p_request_hash: input.requestHash,
    p_resource_id: input.resourceId ?? null,
  });
  if (error || !data?.[0]) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to reserve operation",
        },
      },
      { status: 500 },
    );
  }
  const operation = data[0];
  if (
    operation.admin_id !== input.adminId ||
    operation.scholar_id !== input.scholarId ||
    operation.operation_type !== input.operationType ||
    operation.request_hash !== input.requestHash
  ) {
    return idempotencyConflict();
  }
  if (!operation.acquired && operation.status === "pending") {
    return NextResponse.json(
      {
        error: {
          code: "OPERATION_IN_PROGRESS",
          message:
            "Operation is already in progress; retry with the same operation ID",
        },
      },
      { status: 409 },
    );
  }
  return operation;
}

export async function failOperation(
  supabase: RpcClient,
  input: { id: string; adminId: string; claimToken: string },
): Promise<boolean> {
  const { data, error } = await supabase.rpc("fail_episode_operation", {
    p_id: input.id,
    p_admin_id: input.adminId,
    p_claim_token: input.claimToken,
  });
  if (error) throw new Error("Failed to mark operation as failed");
  return data === true;
}

export async function completeOperation<T>(
  supabase: RpcClient,
  input: {
    id: string;
    adminId: string;
    resourceId?: string | null;
    objectKey?: string | null;
    objectUrl?: string | null;
    responseBody?: T;
    fileSizeBytes?: number | null;
    contentType?: string | null;
    fileExtension?: string | null;
    claimToken: string;
  },
): Promise<T> {
  const { data, error } = await supabase.rpc("complete_episode_operation", {
    p_id: input.id,
    p_admin_id: input.adminId,
    p_claim_token: input.claimToken,
    p_resource_id: input.resourceId ?? null,
    p_object_key: input.objectKey ?? null,
    p_object_url: input.objectUrl ?? null,
    p_response_body: input.responseBody ?? null,
    p_file_size_bytes: input.fileSizeBytes ?? null,
    p_content_type: input.contentType ?? null,
    p_file_extension: input.fileExtension ?? null,
  });
  if (error || data === null) {
    throw new Error("Failed to complete operation");
  }
  return data as T;
}
