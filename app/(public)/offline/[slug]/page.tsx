import { Header } from "@/components/layout/header";
import { OfflineLecture } from "../../lectures/[slug]/offline-lecture";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OfflineLecturePage({ params }: Props) {
  const { slug } = await params;

  return (
    <>
      <Header title="Lecture" backHref="/downloads" backLabel="Downloads" />
      <main className="flex-1">
        <OfflineLecture slug={slug} />
      </main>
    </>
  );
}
