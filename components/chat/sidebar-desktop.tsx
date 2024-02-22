import { Sidebar } from "@/components/chat/sidebar";
import { getSession } from "@/lib/auth";
import { ChatHistory } from "@/components/chat/chat-history";

export async function SidebarDesktop() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      <ChatHistory userId={session.user.id} />
    </Sidebar>
  );
}
