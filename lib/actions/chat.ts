"use server";

import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { type Chat } from "@/lib/types";

export async function getChats(userId?: string | null, aiId?: string | null) {
  if (!userId || !aiId) {
    return [];
  }

  try {
    const pipeline = kv.pipeline();
    const chats: string[] = await kv.zrange(
      `user:${userId}:ai:${aiId}`,
      0,
      -1,
      {
        rev: true,
      },
    );

    for (const chat of chats) {
      pipeline.hgetall(chat);
    }

    const results = await pipeline.exec();

    return results as Chat[];
  } catch (error) {
    return [];
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`);

  if (!chat || chat.userId !== userId) {
    return null;
  }

  chat.createdAt = +chat.createdAt;
  return chat;
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await getSession();

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  const uid = String(await kv.hget(`chat:${id}`, "userId"));

  if (uid !== session?.user?.id) {
    return {
      error: "Unauthorized",
    };
  }

  const aiId = String(await kv.hget(`chat:${id}`, "aiId"));

  await kv.del(`chat:${id}`);
  await kv.zrem(`user:${session.user.id}:ai:${aiId}`, `chat:${id}`);

  revalidatePath("/");
  return revalidatePath(path);
}

export async function clearChats(aiId?: string | null) {
  if (!aiId) {
    return;
  }

  const session = await getSession();

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    };
  }

  const chats: string[] = await kv.zrange(
    `user:${session.user.id}:ai:${aiId}`,
    0,
    -1,
  );
  if (!chats.length) {
    return redirect("/");
  }
  const pipeline = kv.pipeline();

  for (const chat of chats) {
    pipeline.del(chat);
    pipeline.zrem(`user:${session.user.id}:ai:${aiId}`, chat);
  }

  await pipeline.exec();

  revalidatePath("/");
  return redirect("/");
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`);

  if (!chat || !chat.sharePath) {
    return null;
  }

  chat.createdAt = +chat.createdAt;
  return chat;
}

export async function shareChat(id: string) {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    };
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`);

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: "Something went wrong",
    };
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`,
  };

  await kv.hmset(`chat:${chat.id}`, payload);

  return payload;
}

export async function saveChat(chat: Chat, aiId: string) {
  const session = await getSession();
  if (!session?.user?.id || !aiId) {
    return;
  }

  const pipeline = kv.pipeline();
  pipeline.hmset(`chat:${chat.id}`, chat);
  pipeline.zadd(`user:${session.user.id}:ai:${aiId}`, {
    score: Date.now(),
    member: `chat:${chat.id}`,
  });
  await pipeline.exec();
}
