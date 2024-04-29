import { MDXRemoteProps } from "next-mdx-remote";
import MDX from "@/components/mdx";

export function EmptyScreen({ welcome }: { welcome?: MDXRemoteProps | null }) {
  if (!welcome) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <MDX source={welcome} />
      </div>
    </div>
  );
}
