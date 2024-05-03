import { Ai } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import BlurImage from "@/components/blur-image";
import { getSession } from "@/lib/auth";
import { placeholderBlurhash } from "@/lib/utils";

export default async function AiCard({ data }: { data: Ai }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const isOwner = data.userId === session.user.id;

  const url =
    data.ownDomain ??
    `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-lg dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/ai/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <BlurImage
          alt={data.name ?? "AI image"}
          width={500}
          height={400}
          className="h-44 object-cover"
          src={data.image ?? "/placeholder.png"}
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
        />
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.instructions}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
        <a
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${url}`
              : `http://${data.subdomain}.localhost:3000`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </a>
        {data.access === "public" ? (
          <Link
            href={`/ai/${data.id}/settings`}
            className="flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium uppercase text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:bg-opacity-50 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:bg-opacity-50"
          >
            <p>public</p>
          </Link>
        ) : data.access === "members" ? (
          <Link
            href={`/ai/${data.id}${isOwner ? "/settings/team" : ""}`}
            className="flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium uppercase text-orange-600 transition-colors hover:bg-orange-200 dark:bg-orange-900 dark:bg-opacity-50 dark:text-orange-400 dark:hover:bg-orange-800 dark:hover:bg-opacity-50"
          >
            <p>Team</p>
          </Link>
        ) : (
          <Link
            href={`/ai/${data.id}/settings`}
            className="flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium uppercase text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900 dark:bg-opacity-50 dark:text-green-400 dark:hover:bg-green-800 dark:hover:bg-opacity-50"
          >
            <p>private</p>
          </Link>
        )}
      </div>
    </div>
  );
}
