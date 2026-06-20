export function formatDuration(seconds: number): string {
  if (seconds < 0 || !Number.isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${m}:${ss}`;
}

export function parseDurationString(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  if (parts.some((p) => p === "")) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 1) return nums[0];
  return null;
}

export async function getAudioDuration(
  _buffer: Buffer,
): Promise<number | null> {
  // TODO: Implement with music-metadata or ffprobe once upload flow is built
  return null;
}
