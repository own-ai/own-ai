import prisma from "@/lib/prisma";
import Form from "@/components/form";
import { updateAi } from "@/lib/actions";
import DeleteAiForm from "@/components/form/delete-ai-form";

export default async function AiSettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const data = await prisma.ai.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Name"
        description="The name for your AI. The name is displayed on the login page of your AI and is therefore visible even if the AI is not public."
        helpText=""
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          maxLength: 100,
        }}
        handleSubmit={updateAi}
      />

      <Form
        title="Access"
        description="Who should be able to use the AI? Public AIs can be used by anyone who knows the URL. Private AIs can only be used by your account."
        helpText=""
        inputAttrs={{
          name: "access",
          type: "select",
          defaultValue: data?.access!,
        }}
        handleSubmit={updateAi}
      />

      <Form
        title="Model"
        description="ownAI offers the leading AI models from the open source community to contribute to the free and independent use of AI technology. Please choose a model as the basis for your AI."
        helpText="Further models will be available soon."
        inputAttrs={{
          name: "model",
          type: "select",
          defaultValue: data?.model!,
        }}
        handleSubmit={updateAi}
      />

      <Form
        title="Instructions"
        description='Instructions for your AI. Please explain to the AI how it should behave. Use direct address, e.g: "You are an assistant for our company Acme. We produce sustainable rubber boots. You develop creative marketing strategies for our social media channels."'
        helpText=""
        inputAttrs={{
          name: "instructions",
          type: "text",
          defaultValue: data?.instructions!,
        }}
        handleSubmit={updateAi}
      />

      <DeleteAiForm aiName={data?.name!} />
    </div>
  );
}
