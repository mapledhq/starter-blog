import Link from "next/link";
import type { MapledRecord } from "@mapled/next";
import { formatDate, linked, linkedList } from "@/lib/mapled";
import type { Author, Category, Post } from "@/mapled-types";

/** Posts as cards: title, date, author, excerpt and categories. Read them with
    `expand: ["author", "categories"]` so the names come along. */
export function PostList({ posts }: { posts: MapledRecord<Post>[] }) {
  if (posts.length === 0) {
    return <p className="empty">No posts yet. Write one in Mapled and publish it.</p>;
  }

  return (
    <ul className="list">
      {posts.map((post) => {
        const author = linked<Author>(post, "author");
        const categories = linkedList<Category>(post, "categories");
        const date = formatDate(post.data["published-on"]);
        return (
          <li key={post.id} className="card">
            <p className="meta">
              {date}
              {date && author ? " • " : null}
              {author ? author.data.name : null}
            </p>
            <h2>
              <Link href={`/posts/${post.data.slug}`}>{post.data.title}</Link>
            </h2>
            {post.data.excerpt ? <p>{post.data.excerpt}</p> : null}
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
          </li>
        );
      })}
    </ul>
  );
}
