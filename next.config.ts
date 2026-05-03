// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    // Add your image domains here when using next/image with external sources
    remotePatterns: [],
  },
};

export default config;