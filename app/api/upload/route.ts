import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

import { isImageUploadEnabled } from "@/lib/environment";

export const runtime = "edge";

export async function POST(req: Request) {
  if (!isImageUploadEnabled()) {
    return new Response("Sorry, but uploading images is currently disabled.", {
      status: 401,
    });
  }

  const file = req.body || "";
  const contentType = req.headers.get("content-type") || "text/plain";
  const filename = `${nanoid()}.${contentType.split("/")[1]}`;
  const blob = await put(filename, file, {
    contentType,
    access: "public",
  });

  return NextResponse.json(blob);
}
