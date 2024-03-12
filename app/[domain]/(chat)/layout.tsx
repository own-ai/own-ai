import { SidebarDesktop } from "@/components/chat/sidebar-desktop";
import { getPublicAiData } from "@/lib/fetchers";

interface ChatLayoutProps {
  params: { domain: string };
  children: React.ReactNode;
}

export default async function ChatLayout({
  params,
  children,
}: ChatLayoutProps) {
  const domain = decodeURIComponent(params.domain);
  const ai = await getPublicAiData(domain);

  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop aiId={ai?.id} />
      <div className="group w-full overflow-auto pl-0 duration-300 ease-in-out animate-in peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {children}
      </div>
    </div>
  );
}
