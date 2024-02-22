"use client";

import LoadingDots from "@/components/icons/loading-dots";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get error message added by next-auth in URL.
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  useEffect(() => {
    const errorMessage = Array.isArray(error) ? error.pop() : error;
    errorMessage && toast.error(errorMessage);
  }, [error]);

  return (
    <div className="mx-5 border border-stone-200 py-10 dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">
      <Image
        alt="ownAI"
        width={64}
        height={64}
        className="relative mx-auto w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
        src="/logo.png"
      />
      <h1 className="mt-6 text-center font-cal text-3xl dark:text-white">
        {submitted ? "Check your e-mail" : "Welcome"}
      </h1>
      <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
        {submitted
          ? "A sign in link has been sent to your e-mail address."
          : "Please enter your e-mail address to log in."}
      </p>

      {submitted ? null : (
        <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
          <input
            name="email"
            type="email"
            placeholder="Your e-mail address"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
          <Suspense
            fallback={
              <div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />
            }
          >
            <button
              disabled={!email || loading}
              onClick={async () => {
                setLoading(true);
                const response = await signIn("email", {
                  email,
                  redirect: false,
                  callbackUrl: "/",
                });
                setLoading(false);
                if (!response?.ok) {
                  toast.error(`Error: ${response?.error}`);
                } else {
                  setSubmitted(true);
                }
              }}
              className={`${
                !email || loading
                  ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                  : "bg-white hover:bg-stone-50 active:bg-stone-100 dark:bg-black dark:hover:border-white dark:hover:bg-black"
              } group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700`}
            >
              {loading ? (
                <LoadingDots color="#A8A29E" />
              ) : (
                <>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                    Log in
                  </p>
                </>
              )}
            </button>
          </Suspense>
        </div>
      )}
    </div>
  );
}
