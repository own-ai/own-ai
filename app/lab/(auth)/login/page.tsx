import Image from "next/image";
import { Suspense } from "react";

import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm
        title="ownAI"
        image={
          <Image
            alt="ownAI"
            width={64}
            height={64}
            className="relative mx-auto w-auto dark:invert"
            src="/logo.png"
          />
        }
      />
    </Suspense>
  );
}
