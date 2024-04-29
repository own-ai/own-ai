"use client";

import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { replaceLinks } from "@/lib/remark-plugins";
import BlurImage from "@/components/blur-image";

export default function MDX({ source }: { source: MDXRemoteProps }) {
  const components = {
    a: replaceLinks,
    BlurImage,
  };

  return (
    <article
      className="prose dark:prose-invert prose-headings:mt-8 prose-headings:font-cal prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg"
      suppressHydrationWarning={true}
    >
      {/* @ts-ignore */}
      <MDXRemote {...source} components={components} />
    </article>
  );
}
