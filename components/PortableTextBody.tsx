/**
 * Portable Text renderer — turns the blogPost.body array into React.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Custom serializers map the schema's embedded blocks to brand-styled markup:
 *   - `image` blocks → responsive figure with optional caption (Sanity CDN)
 *   - `pullQuote` blocks → styled blockquote
 *   - links → safe anchors
 *   Reuse this anywhere Portable Text is rendered (e.g. a future "about" page).
 */

import { PortableText, type PortableTextComponents } from "next-sanity";
import { urlFor } from "@/lib/sanity/image";
import type { PortableTextBlock } from "next-sanity";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const url = urlFor(value).width(1200).auto("format").url();
      return (
        <figure className="post-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={value.alt || ""} loading="lazy" />
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
    pullQuote: ({ value }) => (
      <blockquote className="post-pullquote">
        <p>{value.quote}</p>
        {value.attribution && <cite>{value.attribution}</cite>}
      </blockquote>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || "#";
      const external = href.startsWith("http");
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

export function PortableTextBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="post-body">
      <PortableText value={value} components={components} />
    </div>
  );
}
