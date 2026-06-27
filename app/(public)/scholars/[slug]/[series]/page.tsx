import { notFound } from "next/navigation";
import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { getSeriesWithEpisodes } from "@/lib/data";
import { SeriesContent } from "./series-content";

interface SeriesPageProps {
  params: Promise<{ slug: string; series: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug, series: seriesSlug } = await params;

  const data = await getSeriesWithEpisodes(slug, seriesSlug);

  if (!data) {
    notFound();
  }

  const { series, episodes } = data;
  const episodeCount = episodes.length;

  return (
    <div className="min-h-screen pb-28">
      <Header>
        <HeaderLeft type="back" label="Back to series" />
        <HeaderCenter
          title={series.title}
          subtitle={`${series.scholar?.name ?? "Scholar"} \u00b7 ${episodeCount} episode${episodeCount !== 1 ? "s" : ""}`}
        />
      </Header>

      <SeriesContent episodes={episodes} />
    </div>
  );
}
