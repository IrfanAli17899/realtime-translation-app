import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    FIREBASE_CONFIG: process.env.FIREBASE_CONFIG,
  },
};

export default nextConfig;
