import { describe, expect, it } from "vitest";
import {
  claimOperation,
  completeOperation,
  failOperation,
  requestHash,
} from "@/lib/admin-operations";
import { isTransientDownloadError } from "@/lib/download";

describe("download retry policy", () => {
  it("retries network, rate-limit, and server failures only", () => {
    expect(isTransientDownloadError(new Error("Failed to fetch"))).toBe(true);
    expect(isTransientDownloadError(new Error("HTTP 429"))).toBe(true);
    expect(isTransientDownloadError(new Error("HTTP 503"))).toBe(true);
    expect(isTransientDownloadError(new Error("HTTP 403"))).toBe(false);
  });
});

describe("atomic operation claims", () => {
  it("replays completed operations and rejects active pending duplicates", async () => {
    const completed = await claimOperation(
      {
        rpc: async () => ({
          data: [
            {
              acquired: false,
              admin_id: "admin",
              scholar_id: "scholar",
              operation_type: "upload",
              request_hash: "hash",
              status: "completed",
              resource_id: null,
              object_url: null,
              object_key: null,
              claim_token: "claim",
            },
          ],
          error: null,
        }),
      },
      {
        id: "op",
        adminId: "admin",
        scholarId: "scholar",
        operationType: "upload",
        requestHash: "hash",
      },
    );
    expect(completed).toMatchObject({ status: "completed" });

    const pending = await claimOperation(
      {
        rpc: async () => ({
          data: [
            {
              acquired: false,
              admin_id: "admin",
              scholar_id: "scholar",
              operation_type: "upload",
              request_hash: "hash",
              status: "pending",
              resource_id: null,
              object_url: null,
              object_key: null,
              claim_token: "claim",
            },
          ],
          error: null,
        }),
      },
      {
        id: "op",
        adminId: "admin",
        scholarId: "scholar",
        operationType: "upload",
        requestHash: "hash",
      },
    );
    expect(pending).toBeInstanceOf(Response);
    expect((pending as Response).status).toBe(409);
  });
});

describe("operation fingerprints", () => {
  it("is stable for a replay and changes with request input", () => {
    const input = { scholarId: "scholar", title: "Lesson" };
    expect(requestHash(input)).toBe(requestHash(input));
    expect(requestHash(input)).not.toBe(
      requestHash({ ...input, title: "Different lesson" }),
    );
  });
});

describe("operation lifecycle", () => {
  it("marks failed and completed operations through database RPCs", async () => {
    const rpc = async (name: string) => ({
      data: name === "complete_episode_operation" ? { id: "op" } : true,
      error: null,
    });

    await expect(
      failOperation(
        { rpc },
        { id: "op", adminId: "admin", claimToken: "claim" },
      ),
    ).resolves.toBe(true);
    await expect(
      completeOperation(
        { rpc },
        {
          id: "op",
          adminId: "admin",
          claimToken: "claim",
          resourceId: "episode",
        },
      ),
    ).resolves.toEqual({ id: "op" });
  });

  it("propagates the claim token to fail and complete RPCs", async () => {
    const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
    const rpc = async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return { data: true, error: null };
    };

    await failOperation(
      { rpc },
      { id: "op", adminId: "admin", claimToken: "claim-1" },
    );
    await completeOperation(
      { rpc },
      { id: "op", adminId: "admin", claimToken: "claim-1", resourceId: "ep" },
    );

    expect(calls[0].args.p_claim_token).toBe("claim-1");
    expect(calls[1].args.p_claim_token).toBe("claim-1");
  });

  it("reclaims a failed operation for retry instead of returning a conflict", async () => {
    const rpc = async () => ({
      data: [
        {
          acquired: true,
          admin_id: "admin",
          scholar_id: "scholar",
          operation_type: "upload",
          request_hash: "hash",
          status: "pending" as const,
          resource_id: null,
          object_url: null,
          object_key: null,
          claim_token: "claim-new",
        },
      ],
      error: null,
    });

    const claim = await claimOperation(
      { rpc },
      {
        id: "op",
        adminId: "admin",
        scholarId: "scholar",
        operationType: "upload",
        requestHash: "hash",
      },
    );

    expect(claim).not.toBeInstanceOf(Response);
    expect(claim).toMatchObject({
      acquired: true,
      status: "pending",
      claim_token: "claim-new",
    });
  });
});
