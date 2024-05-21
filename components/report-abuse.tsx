"use client";

import va from "@vercel/analytics";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";

export default function ReportAbuse() {
  const [open, setOpen] = useState(false);
  const params = useParams() as { domain: string };
  const domain = decodeURIComponent(params.domain);
  const url = `https://${domain}`;

  return (
    <div className="fixed bottom-5 right-5">
      <button
        className="rounded-full bg-black p-4 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm"
        onClick={() => setOpen(!open)}
      >
        <AlertTriangle size={24} />
      </button>
      {open && (
        <form
          action={async (formData) => {
            const url = formData.get("url") as string;
            va.track("Reported Abuse", { url });
            // artificial 1s delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setOpen(false);
            toast.success(
              "Successfully reported abuse – thank you for helping us keep AI safe!",
            );
          }}
          className="absolute bottom-20 right-2 flex w-96 flex-col space-y-6 rounded-lg border border-stone-200 bg-white p-8 shadow-lg animate-in slide-in-from-bottom-5"
        >
          <div>
            <h2 className="font-cal text-xl leading-7 text-stone-900">
              Report Abuse
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Found an AI with abusive content? Let us know!
            </p>
          </div>

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium leading-6 text-stone-900"
            >
              URL to report
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="url"
                id="url"
                readOnly
                value={url}
                className="block w-full cursor-not-allowed rounded-md border border-stone-200 bg-stone-100 py-1.5 text-stone-900 shadow-sm ring-0 focus:outline-none sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <SubmitButton />
        </form>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "h flex h-8 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
          : "border-black bg-black text-white hover:bg-white hover:text-black",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Report Abuse</p>}
    </button>
  );
}
