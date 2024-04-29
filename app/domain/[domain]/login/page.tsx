import Image from "next/image";
import { Suspense } from "react";
import LoginForm from "@/components/login-form";
import { getPublicAiData } from "@/lib/fetchers";

export default async function SignInPage({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const data = await getPublicAiData(domain);

  const title = data?.name ?? "";
  const imageUrl = data?.image;

  return (
    <Suspense>
      <LoginForm
        title={title}
        image={
          imageUrl ? (
            <Image
              alt={title}
              width={240}
              height={160}
              className="relative mx-auto w-60 dark:scale-110 dark:rounded-full"
              src={imageUrl}
            />
          ) : null
        }
      />
    </Suspense>
  );
}
