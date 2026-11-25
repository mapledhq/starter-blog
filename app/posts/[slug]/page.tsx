import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import { formatDate, imageUrl, linked, linkedList, mapled } from "@/lib/mapled";
import type { Author, Category } from "@/mapled-types";

type Props = { params: Promise<{ slug: string }> };

// Pages of posts that exist at build time are made then; a post published
// later gets its page on the first visit, without a deploy.
export async function generateStaticParams() {
  const { records } = await mapled.getRecords("posts", { fields: ["slug"] });
  return records.map((post) => ({ slug: post.data.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await mapled.getRecordBySlug("posts", (await params).slug, { fields: ["title", "excerpt"] });
  return post ? { title: post.data.title, description: post.data.excerpt ?? undefined } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await mapled.getRecordBySlug("posts", (await params).slug, { expand: ["author", "categories"] });
  if (!post) notFound();

  const author = linked<Author>(post, "author");
  const categories = linkedList<Category>(post, "categories");
  const date = formatDate(post.data["published-on"]);

  return (
    <article>
      <p className="meta">
        {date}
        {date && author ? " • " : null}
        {author ? <Link href={`/authors/${author.data.slug}`}>{author.data.name}</Link> : null}
      </p>
      <h1>{post.data.title}</h1>
      {post.data.excerpt ? <p className="lead">{post.data.excerpt}</p> : null}
      {post.data.cover ? <img className="cover" src={imageUrl(post.data.cover, 1280)} alt="" /> : null}
      <RichText>{post.data.body}</RichText>
      {categories.length > 0 ? (
        <ul className="tags">
          {categories.map((category) => (
            <li key={category.id}>
              <Link className="tag" href={`/categories/${category.data.slug}`}>
                {category.data.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {author ? (
        <aside className="author-box">
          {author.data.photo ? <img src={imageUrl(author.data.photo, 128)} alt="" /> : null}
          <div>
            <p>
              <Link href={`/authors/${author.data.slug}`}>{author.data.name}</Link>
            </p>
            {author.data.bio ? <p className="meta">{author.data.bio}</p> : null}
          </div>
        </aside>
      ) : null}
    </article>
  );
}
