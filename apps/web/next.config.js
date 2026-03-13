/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ai-job-search/types", "@ai-job-search/shared"],
  env: {
    API_URL: process.env.API_URL || "http://localhost:3001",
  },
};

export default nextConfig;
