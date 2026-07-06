import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { OfflineLecture } from "../../lectures/[slug]/offline-lecture";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OfflineLecturePage({ params }: Props) {
  const { slug } = await params;

  return (
    <>
      <Header>
        <HeaderLeft type="back" label="Downloads" href="/downloads" />
        <HeaderCenter title="Lecture" />
      </Header>
      <main className="flex-1">
        <OfflineLecture slug={slug} />
      </main>
    </>
  );
}
