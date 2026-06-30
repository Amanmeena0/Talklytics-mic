import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Explicitly set Turbopack root to the project directory
  turbopack: {
    root: __dirname,
  },
  // you can add other Next.js config options here
};

export default nextConfig;
