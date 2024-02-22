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
    <article className="mdx" suppressHydrationWarning={true}>
      {/* @ts-ignore */}
      <MDXRemote {...source} components={components} />
    </article>
  );
}
