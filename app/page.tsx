import { mapled } from "@/lib/mapled";
import { PostList } from "@/components/post-list";

export default async function Home() {
  const { records: posts } = await mapled.getRecords("posts", {
    sort: "-published-on",
    expand: ["author", "categories"],
    limit: 50,
  });

  return (
    <>
      <h1>Latest posts</h1>
      <p className="lead">Every post, author and category on this site is edited in Mapled.</p>
      <PostList posts={posts} />
    </>
  );
}
