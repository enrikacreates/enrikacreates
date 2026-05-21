/**
 * Blog index — /blog. Grid of post cards using the shared hero color + image.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Server Component. Lists all posts newest-first. Each card links to
 *   /blog/[slug]. Visual treatment intentionally mirrors the work cards so
 *   the blog feels like part of the same brand world.
 */

import Link from "next/link";
import { getAllPosts } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";
import { isDarkColor } from "@/lib/colorUtils";

export const metadata = {
  title: "Journal — Enrika Creates",
  description: "Essays and field notes on design, product, community, and hope.",
};

const THREAD_LABELS: Record<string, string> = {
  fashion: "Fashion",
  product: "Product",
  community: "Community Building",
  hope: "Everyday Hope Stories",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <section className="blog-index">
      <header className="blog-index-head">
        <h1 className="blog-index-title">Journal</h1>
        <p className="blog-index-sub">
          One letter. Four threads — fashion, product, community building, and everyday hope.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="blog-empty">No posts yet — the first letter is on its way.</p>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => {
            const dark = isDarkColor(post.color);
            const imgUrl = post.leadImage?.asset
              ? urlFor(post.leadImage).width(800).height(600).fit("crop").auto("format").url()
              : undefined;
            return (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className={`blog-card${dark ? " dark-card" : ""}`}
                style={{ "--card-color": post.color } as React.CSSProperties}
              >
                {imgUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="blog-card-img" src={imgUrl} alt="" loading="lazy" />
                )}
                <div className="blog-card-body">
                  <span className="blog-card-thread">{THREAD_LABELS[post.category]}</span>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-tagline">{post.tagline}</p>
                  <time className="blog-card-date">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
