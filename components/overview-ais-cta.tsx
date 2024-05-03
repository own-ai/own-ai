import Link from "next/link";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function OverviewAisCTA() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const ais = await prisma.ai.count({
    where: {
      userId: session.user.id as string,
    },
  });

  return ais > 0 ? (
    <Link
      href="/ais"
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      View All AIs
    </Link>
  ) : null;
}
