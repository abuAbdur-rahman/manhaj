import { describe, expect, it } from "vitest";
import { getAudioDuration } from "@/lib/audio";

const SAMPLE_RATE = 8000;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 8;

function pcmWavBuffer(durationSeconds: number): Buffer {
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const dataBytes = SAMPLE_RATE * CHANNELS * bytesPerSample * durationSeconds;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * bytesPerSample, 28);
  buffer.writeUInt16LE(CHANNELS * bytesPerSample, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);

  return buffer;
}

describe("getAudioDuration", () => {
  it("reads duration from a valid PCM WAV buffer", async () => {
    const duration = await getAudioDuration(pcmWavBuffer(5));
    expect(duration).toBeCloseTo(5, 1);
  });

  it("returns null for unparseable input instead of throwing", async () => {
    const garbage = Buffer.from("this is not an audio file at all");
    await expect(getAudioDuration(garbage)).resolves.toBeNull();
  });
});
