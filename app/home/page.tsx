import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <Image width={64} height={64} src="/logo.png" alt="ownAI" />
      <h1>Coming soon</h1>
    </div>
  );
}
