/**
 * Blog post detail — /blog/[slug].
 *
 * MIGRATION TEMPLATE NOTE:
 *   Colored hero band (post.color + leadImage) mirrors the project card-as-hero
 *   so blog + portfolio feel unified. Body is rendered via PortableTextBody.
 *   Related posts (if set) link out at the end.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";
import { isDarkColor } from "@/lib/colorUtils";
import { PortableTextBody } from "@/components/PortableTextBody";

export const dynamicParams = true;

const THREAD_LABELS: Record<string, string> = {
  fashion: "Fashion",
  product: "Product",
  community: "Community Building",
  hope: "Everyday Hope Stories",
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found — Enrika Creates" };
  return {
    title: `${post.title} — Enrika Creates`,
    description: post.seoDescription || post.excerpt || post.tagline,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const dark = isDarkColor(post.color);
  const heroImg = post.leadImage?.asset
    ? urlFor(post.leadImage).width(1600).height(900).fit("crop").auto("format").url()
    : undefined;

  return (
    <article className={`post${dark ? " dark-post" : ""}`}>
      {/* Hero band */}
      <header className="post-hero" style={{ background: post.color }}>
        <Link href="/blog" className="post-back" aria-label="Back to journal">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <path d="M7 1L1 7L7 13M1 7H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Journal</span>
        </Link>
        <div className="post-hero-inner">
          <span className="post-thread">{THREAD_LABELS[post.category]}</span>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-tagline">{post.tagline}</p>
          <time className="post-date">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
        {heroImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="post-hero-img" src={heroImg} alt="" />
        )}
      </header>

      {/* Body */}
      <div className="post-content">
        {post.body && post.body.length > 0 && <PortableTextBody value={post.body} />}

        {/* Related */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <aside className="post-related">
            <h2 className="post-related-title">Keep reading</h2>
            <ul>
              {post.relatedPosts.map((rel) => (
                <li key={rel._id}>
                  <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
