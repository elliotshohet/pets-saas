/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '127.0.0.1',
    ...(process.env.APP_URL ? [new URL(process.env.APP_URL).hostname] : []),
  ],
  experimental: {
    agentUpgrade: 'security',
    serverActions: { bodySizeLimit: '12mb' },
  },
};
export default nextConfig;
