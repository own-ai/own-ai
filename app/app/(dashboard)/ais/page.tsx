import { Suspense } from "react";
import Ais from "@/components/ais";
import PlaceholderCard from "@/components/placeholder-card";
import CreateAiButton from "@/components/create-ai-button";
import CreateAiModal from "@/components/modal/create-ai";

export default function AllAis({ params }: { params: { id: string } }) {
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="mt-12 flex flex-col space-y-6 sm:mt-0">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Your AIs
          </h1>
          <CreateAiButton>
            <CreateAiModal />
          </CreateAiButton>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          {/* @ts-expect-error Server Component */}
          <Ais aiId={decodeURIComponent(params.id)} />
        </Suspense>
      </div>
    </div>
  );
}
