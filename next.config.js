/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ["lab.localhost:3000", "demo.localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      { hostname: "public.blob.vercel-storage.com" },
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "abs.twimg.com" },
      { hostname: "pbs.twimg.com" },
      { hostname: "avatar.vercel.sh" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "www.google.com" },
      { hostname: "flag.vercel.app" },
      { hostname: "illustrations.popsy.co" },
      { hostname: "localhost" },
      { hostname: "ownai.com" },
    ],
  },
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
};
