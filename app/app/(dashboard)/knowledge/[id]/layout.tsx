import { ReactNode } from "react";

export default function KnowledgeLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col space-y-6 sm:p-10">{children}</div>;
}
