"use server";

import prisma from "@/lib/prisma";

export const canUseCredentials = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      passhash: true,
    },
  });
  return !!user?.passhash;
};
