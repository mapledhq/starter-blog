import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { allPosts, mapled } from "@/lib/mapled";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { records } = await mapled.getRecords("categories", { fields: ["slug"] });
  return records.map((category) => ({ slug: category.data.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await mapled.getRecordBySlug("categories", (await params).slug, { fields: ["name", "description"] });
  return category ? { title: category.data.name, description: category.data.description ?? undefined } : {};
}

export default async function CategoryPage({ params }: Props) {
  const category = await mapled.getRecordBySlug("categories", (await params).slug);
  if (!category) notFound();

  // a one-to-many relation matches when it includes the id
  const posts = await allPosts({ categories: category.id });

  return (
    <>
      <h1>{category.data.name}</h1>
      {category.data.description ? <p className="lead">{category.data.description}</p> : null}
      <PostList posts={posts} />
    </>
  );
}
