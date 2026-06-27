import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Header,
  HeaderCenter,
  HeaderLeft,
  HeaderRight,
} from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDuration } from "@/lib/audio";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getDashboardStats,
  getEpisodesForAdmin,
  getScholarById,
} from "@/lib/data";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  const scopedScholarId =
    admin?.role === "scholar_admin" ? (admin.scholarId ?? undefined) : undefined;

  if (admin?.role === "scholar_admin" && !scopedScholarId) {
    throw new Error("Scholar admin is missing scholar scope");
  }

  const [episodes, stats] = await Promise.all([
    getEpisodesForAdmin(scopedScholarId, 10),
    admin?.role === "super_admin" ? getDashboardStats() : null,
  ]);

  const scholar =
    admin?.role === "scholar_admin" && scopedScholarId
      ? await getScholarById(scopedScholarId)
      : null;

  return (
    <>
      <Header>
        <HeaderLeft type="logo" />
        <HeaderCenter title="Dashboard" />
        <HeaderRight>
          {admin && (
            <span className="text-sm font-medium text-forest-700">
              {admin.name}
            </span>
          )}
        </HeaderRight>
      </Header>

      <main className="flex-1 pb-20 lg:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/episodes/new"
              className={cn(buttonVariants({ variant: "primary" }), "gap-2")}
            >
              <Plus className="h-4 w-4" />
              New episode
            </Link>
            <Link
              href="/admin/series/new"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <Plus className="h-4 w-4" />
              New series
            </Link>
          </div>

          {scholar && (
            <div className="mt-6 rounded-lg border border-sand-200 bg-sand-100 px-4 py-3">
              <p className="text-sm text-forest-700">
                Your scope:{" "}
                <span className="font-semibold text-forest-900">
                  {scholar.name}
                </span>
              </p>
            </div>
          )}

          {stats && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-sand-200 bg-sand-100 p-4">
                <p className="text-label text-sand-300">Scholars</p>
                <p className="mt-1 font-mono text-title font-semibold text-forest-900">
                  {stats.scholarCount}
                </p>
              </div>
              <div className="rounded-lg border border-sand-200 bg-sand-100 p-4">
                <p className="text-label text-sand-300">Total Episodes</p>
                <p className="mt-1 font-mono text-title font-semibold text-forest-900">
                  {stats.episodeCount}
                </p>
              </div>
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-title font-semibold text-forest-700">
              Recent Uploads
            </h2>

            {episodes.length > 0 ? (
              <div className="mt-4 divide-y divide-sand-200">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-sand-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-forest-900 truncate">
                        {episode.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-forest-700">
                          {episode.scholar?.name}
                        </span>
                        {episode.series && (
                          <>
                            <span className="text-xs text-sand-300">·</span>
                            <span className="text-xs text-forest-700">
                              {episode.series.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={episode.is_published ? "default" : "outline"}
                    >
                      {episode.is_published ? "Published" : "Draft"}
                    </Badge>

                    <span className="font-mono text-xs text-sand-300 shrink-0">
                      {formatDuration(episode.duration_seconds ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="No episodes yet"
                  description="Create your first episode."
                  action={
                    <Link
                      href="/admin/episodes/new"
                      className={buttonVariants({ variant: "primary" })}
                    >
                      Create episode
                    </Link>
                  }
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
