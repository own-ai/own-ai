import { Knowledge, Ai } from "@prisma/client";
import Link from "next/link";

export default function KnowledgeCard({
  data,
}: {
  data: Knowledge & { ai: Ai | null };
}) {
  return (
    <div className="relative rounded-lg border border-stone-200 shadow-md transition-all hover:shadow-lg dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/knowledge/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <div className="min-h-[108px] border-t border-stone-200 p-4 dark:border-stone-700">
          {!data.learned && (
            <span className="absolute right-2 rounded-md border border-stone-200 bg-white px-3 py-0.5 text-sm font-medium text-stone-600 shadow-sm">
              Not learned
            </span>
          )}
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white dark:text-white">
            {data.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description ?? data.content}
          </p>
        </div>
      </Link>
    </div>
  );
}
