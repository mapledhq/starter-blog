import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { draftMode } from "next/headers";
import { MapledLive } from "@mapled/next/live";
import { mapled } from "@/lib/mapled";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Blog", template: "%s · Blog" },
  description: "Posts, authors and categories, edited in Mapled.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const preview = (await draftMode()).isEnabled;
  const { records: categories } = await mapled.getRecords("categories", { sort: "name", fields: ["name", "slug"] });

  return (
    <html lang="en">
      <body>
        {preview ? (
          <div className="preview-bar">
            You are looking at drafts. <a href="/api/mapled/preview/exit">Exit preview</a>
          </div>
        ) : null}
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              Blog
            </Link>
            <nav className="site-nav" aria-label="Categories">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.data.slug}`}>
                  {category.data.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main>
          <div className="container">{children}</div>
        </main>
        <footer className="site-footer">
          <div className="container">Content from Mapled.</div>
        </footer>
        <MapledLive />
      </body>
    </html>
  );
}
