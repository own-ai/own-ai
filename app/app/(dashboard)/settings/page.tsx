import Form from "@/components/form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { editUser } from "@/lib/actions";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Settings
        </h1>
        <Form
          title="Name"
          description="How should we call you?"
          helpText=""
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: session.user.name!,
            maxLength: 100,
          }}
          handleSubmit={editUser}
        />
        <Form
          title="E-mail"
          description="Please keep your e-mail address up-to-date. You will need access to your mails when you log in to ownAI."
          helpText=""
          inputAttrs={{
            name: "email",
            type: "email",
            defaultValue: session.user.email!,
          }}
          handleSubmit={editUser}
        />
      </div>
    </div>
  );
}
