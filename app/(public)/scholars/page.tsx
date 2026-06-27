import Link from "next/link";
import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { ScholarRow } from "@/components/scholars/scholar-row";
import { getAllScholars } from "@/lib/data";

export default async function ScholarsPage() {
  const scholars = await getAllScholars();

  return (
    <>
      <Header>
        <HeaderLeft type="back" label="Scholars" />
        <HeaderCenter title="Scholars" />
      </Header>

      <main className="flex-1 pb-14">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <h1 className="py-6 text-xl font-semibold text-forest-700">
            Our Scholars
          </h1>

          {scholars.length > 0 ? (
            <div className="divide-y divide-sand-200">
              {scholars.map((scholar) => (
                <Link key={scholar.id} href={`/scholars/${scholar.slug}`}>
                  <ScholarRow scholar={scholar} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-sand-300">
              No scholars yet. Check back soon.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
