import { notFound } from "next/navigation";
import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WaveformSeal } from "@/components/ui/waveform-seal";
import {
  getScholarBySlug,
  getScholarEpisodes,
  getScholarSeries,
} from "@/lib/data";
import { ScholarTabs } from "./scholar-tabs";

export default async function ScholarProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scholar = await getScholarBySlug(slug);

  if (!scholar) {
    notFound();
  }

  const [series, episodes] = await Promise.all([
    getScholarSeries(scholar.id),
    getScholarEpisodes(scholar.id),
  ]);

  return (
    <>
      <Header>
        <HeaderLeft type="back" label={scholar.name} />
        <HeaderCenter title={scholar.name} />
      </Header>

      <main className="flex-1 pb-14">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <div className="relative flex flex-col items-center py-10">
            <div className="relative">
              <Avatar
                size="xl"
                src={scholar.photo_url ?? undefined}
                fallback={scholar.name}
                alt={scholar.name}
              />
              <WaveformSeal
                variant="watermark"
                className="absolute inset-0 flex items-center justify-center -z-10 scale-150"
              />
            </div>

            <h1 className="mt-4 text-2xl font-semibold text-forest-900 text-center">
              {scholar.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {scholar.languages.map((lang) => (
                <Badge key={lang} variant="default">
                  {lang}
                </Badge>
              ))}
            </div>

            {scholar.bio && <ScholarBio bio={scholar.bio} />}

            {scholar.social_links && (
              <div className="mt-4 flex items-center gap-2">
                {scholar.social_links.whatsapp && (
                  <a
                    href={scholar.social_links.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    WhatsApp
                  </a>
                )}
                {scholar.social_links.youtube && (
                  <a
                    href={scholar.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    YouTube
                  </a>
                )}
                {scholar.social_links.telegram && (
                  <a
                    href={scholar.social_links.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Telegram
                  </a>
                )}
                {scholar.social_links.website && (
                  <a
                    href={scholar.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Website
                  </a>
                )}
              </div>
            )}
          </div>

          <ScholarTabs series={series} episodes={episodes} />
        </div>
      </main>
    </>
  );
}

function ScholarBio({ bio }: { bio: string }) {
  return (
    <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-forest-700 line-clamp-2">
      {bio}
    </p>
  );
}
