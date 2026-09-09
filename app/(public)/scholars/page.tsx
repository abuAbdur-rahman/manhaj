import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ScholarRow } from "@/components/scholars/scholar-row";
import { getAllScholars } from "@/lib/data";

export default async function ScholarsPage() {
  const scholars = await getAllScholars();

  return (
    <>
      <Header title="Scholars" />

      <main className="flex-1 page-enter">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <h1 className="py-6 text-lg font-bold text-forest-900 dark:text-ink-100">
            Our Scholars
          </h1>

          {scholars.length > 0 ? (
            <div className="space-y-2.5">
              {scholars.map((scholar) => (
                <Link key={scholar.id} href={`/scholars/${scholar.slug}`}>
                  <ScholarRow scholar={scholar} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-sand-300 dark:text-ink-500">
              No scholars yet. Check back soon.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
