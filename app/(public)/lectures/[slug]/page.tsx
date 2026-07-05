import { notFound } from "next/navigation";
import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { getEpisodeBySlug, getSeriesEpisodes } from "@/lib/data";
import { LectureContent } from "./lecture-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LecturePage({ params }: Props) {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);

  if (!episode) {
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
