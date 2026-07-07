import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
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
    <div className="min-h-screen">
      <Header
        title={series.title}
        subtitle={`${series.scholar?.name ?? "Scholar"} \u00b7 ${episodeCount} episode${episodeCount !== 1 ? "s" : ""}`}
        backLabel={series.scholar?.name ?? "Scholar"}
      />

      <SeriesContent episodes={episodes} />
    </div>
  );
}
