"use client";

import { signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useState } from "react";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { canUseCredentials } from "@/lib/actions/auth";

export default function LoginForm({
  title,
  image,
}: {
  title: string;
  image?: ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [withCredentials, setWithCredentials] = useState(false);

  // Get error added by next-auth in URL.
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const router = useRouter();
  const pathname = usePathname();
  const callbackUrl = pathname.replace(/login$/, "");

  const submit = async () => {
    if (!email || loading) {
      return;
    }

    setLoading(true);
    const useCredentials = await canUseCredentials(email);
    setWithCredentials(useCredentials);

    if (useCredentials && !password) {
      setLoading(false);
      return;
    }

    const response = await signIn(useCredentials ? "credentials" : "email", {
      email,
      password,
      redirect: false,
      callbackUrl: useCredentials ? undefined : callbackUrl,
    });
    setLoading(false);

    if (!response?.ok) {
      let message = response?.error;
      if (message === "CredentialsSignin") {
        message = "The username or password is incorrect.";
      }

      toast.error(`Error: ${message}`);
      return;
    }

    if (useCredentials) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="mx-5 my-10 border border-stone-200 bg-background py-10 text-foreground dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">
      {image}
      <h1 className="mt-6 text-center font-cal text-3xl dark:text-white">
        {submitted ? "Check your e-mail" : error ? "Unable to sign in" : title}
      </h1>
      {!submitted && error === "Verification" ? (
        <p className="mx-2 mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
          The sign in link is no longer valid. It may have been used already or
          it may have expired. Please try again.
        </p>
      ) : null}
      <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
        {submitted
          ? "I sent a sign in link to your e-mail address."
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submit();
              }
            }}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
          {withCredentials ? (
            <input
              name="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submit();
                }
              }}
              required
              className="my-2 w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
            />
          ) : null}
          <Suspense
            fallback={
              <div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />
            }
          >
            <button
              disabled={!email || loading}
              onClick={submit}
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
