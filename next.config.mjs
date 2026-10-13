/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '127.0.0.1',
    ...(process.env.BETTER_AUTH_URL ? [new URL(process.env.BETTER_AUTH_URL).hostname] : []),
  ],
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
};
export default nextConfig;
