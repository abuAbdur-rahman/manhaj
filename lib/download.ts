import { saveDownload } from "@/lib/downloads-db";
import type { Episode } from "@/types";

export async function downloadEpisode(episode: Episode): Promise<void> {
  const response = await fetch(episode.audio_url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  const blob = await response.blob();
  await saveDownload(episode, blob.size, episode.audio_url);
}
