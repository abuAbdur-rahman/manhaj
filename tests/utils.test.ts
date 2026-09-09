import { describe, expect, it } from "vitest";
import { formatCount } from "@/lib/utils";

describe("formatCount", () => {
  it("uses singular labels only for one item", () => {
    expect(formatCount(0, "lecture")).toBe("0 lectures");
    expect(formatCount(1, "lecture")).toBe("1 lecture");
    expect(formatCount(2, "episode")).toBe("2 episodes");
  });
});
