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
      {ai ? <SidebarDesktop domain={domain} aiId={ai.id} /> : null}
      {children}
    </div>
  );
}
