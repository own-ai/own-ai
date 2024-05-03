import { notFound, redirect } from "next/navigation";

import Form from "@/components/form";
import { updateAi } from "@/lib/actions/app";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AiSettingsAppearance({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await prisma.ai.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Image"
        description="An image for your AI. Accepted formats: .png, .jpg, .jpeg. The image is displayed on the login page of your AI and is therefore visible even if the AI is not public."
        helpText="Max file size 4 MB. Recommended size 1200x630."
        inputAttrs={{
          name: "image",
          type: "file",
          defaultValue: data?.image!,
        }}
        handleSubmit={updateAi}
      />
      <Form
        title="Welcome Message"
        description="This page is displayed when the AI has been opened and is waiting for input. You can add a welcome message here or instructions on how the AI works and what abilities it has."
        helpText=""
        inputAttrs={{
          name: "welcome",
          type: "text",
          defaultValue: data?.welcome!,
        }}
        handleSubmit={updateAi}
      />
      <Form
        title="Conversation Starters"
        description="Add some examples to show how your AI works and to quickly start a conversation."
        helpText=""
        inputAttrs={{
          name: "starters",
          type: "text",
          defaultValue: JSON.stringify(data?.starters),
        }}
        handleSubmit={updateAi}
      />
    </div>
  );
}
