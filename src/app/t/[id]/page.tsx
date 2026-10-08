import { notFound } from "next/navigation";
import { tagById } from "@/lib/data";
import { TagLanding } from "./TagLanding";

export default async function TagPage({ params }: PageProps<"/t/[id]">) {
  const { id } = await params;
  if (!tagById(id)) notFound();
  return <TagLanding id={id} />;
}
