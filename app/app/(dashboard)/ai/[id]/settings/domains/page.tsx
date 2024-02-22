import prisma from "@/lib/prisma";
import Form from "@/components/form";
import { updateAi } from "@/lib/actions";

export default async function AiSettingsDomains({
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
        title="Subdomain"
        description="The subdomain for your AI."
        helpText="Please use 64 characters maximum."
        inputAttrs={{
          name: "subdomain",
          type: "text",
          defaultValue: data?.subdomain!,
          maxLength: 64,
        }}
        handleSubmit={updateAi}
      />
      <Form
        title="Own Domain"
        description="Set your own domain for your AI! For example, this could be a subdomain of your company or a personal domain under which you want to make your AI accessible."
        helpText="Please enter a valid domain that you own (e.g. yourai.com or ai.yourcompany.com)."
        inputAttrs={{
          name: "ownDomain",
          type: "text",
          defaultValue: data?.ownDomain!,
          maxLength: 200,
          pattern: "^[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}$",
        }}
        handleSubmit={updateAi}
      />
    </div>
  );
}
