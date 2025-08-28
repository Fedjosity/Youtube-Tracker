/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the output: 'export' for Vercel deployment
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ["@supabase/ssr"],
  },
};

module.exports = nextConfig;
