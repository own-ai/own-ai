import Image from "next/image";

export default function LoginError() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <Image width={64} height={64} src="/logo.png" alt="Logo" />
      <h1 className="font-cal text-2xl font-bold">Unable to sign in</h1>
      <p>
        The sign in link is no longer valid. It may have been used already or it
        may have expired.
      </p>
    </div>
  );
}
