import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { allPosts, imageUrl, mapled } from "@/lib/mapled";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { records } = await mapled.getRecords("authors", { fields: ["slug"] });
  return records.map((author) => ({ slug: author.data.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await mapled.getRecordBySlug("authors", (await params).slug, { fields: ["name", "bio"] });
  return author ? { title: author.data.name, description: author.data.bio ?? undefined } : {};
}

export default async function AuthorPage({ params }: Props) {
  const author = await mapled.getRecordBySlug("authors", (await params).slug);
  if (!author) notFound();

  const posts = await allPosts({ author: author.id });

  return (
    <>
      {author.data.photo ? <img className="cover" src={imageUrl(author.data.photo, 256)} alt="" width={128} /> : null}
      <h1>{author.data.name}</h1>
      {author.data.bio ? <p className="lead">{author.data.bio}</p> : null}
      <PostList posts={posts} />
    </>
  );
}
