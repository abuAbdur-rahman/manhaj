import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { getEpisodeBySlug, getSeriesEpisodes } from "@/lib/data";
import { LectureContent } from "./lecture-content";
import { OfflineLecture } from "./offline-lecture";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);

  if (!episode) {
    return { title: "Lecture not found" };
  }

  return {
    title: episode.title,
    description:
      episode.description ||
      `Listen to ${episode.title} by ${episode.scholar?.name}`,
    openGraph: {
      title: episode.title,
      description:
        episode.description || `A lecture by ${episode.scholar?.name}`,
      type: "music.song",
      images: episode.scholar?.photo_url
        ? [{ url: episode.scholar.photo_url, width: 300, height: 300 }]
        : undefined,
    },
  };
}

export default async function LecturePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { mode } = await searchParams;

  const episode = await getEpisodeBySlug(slug);

  if (!episode) {
    if (mode === "offline") {
      return (
        <>
          <Header>
            <HeaderLeft type="back" label="Lecture" />
            <HeaderCenter title="Lecture" />
          </Header>
          <main className="flex-1">
            <OfflineLecture slug={slug} />
          </main>
        </>
      );
    }
    notFound();
  }

  let moreEpisodes: import("@/types").Episode[] = [];
  if (episode.series_id) {
    moreEpisodes = (await getSeriesEpisodes(episode.series_id, 10)).filter(
      (e) => e.id !== episode.id,
    );
  }

  return (
    <>
      <Header>
        <HeaderLeft type="back" label="Lecture" />
        <HeaderCenter title={episode.title} />
      </Header>

      <main className="flex-1">
        <LectureContent episode={episode} moreEpisodes={moreEpisodes} />
      </main>
    </>
  );
}
