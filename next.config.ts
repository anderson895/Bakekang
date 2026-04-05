import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['next-cloudinary'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  serverExternalPackages: ['cloudinary'],
};

export default nextConfig;
