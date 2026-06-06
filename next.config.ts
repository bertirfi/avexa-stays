import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Ignore legacy HTML/JSX prototype files at project root from build
  pageExtensions: ['ts', 'tsx'],
};

export default config;
