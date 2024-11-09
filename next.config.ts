import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    FIREBASE_CONFIG: process.env.FIREBASE_CONFIG,
  },
  webpack: (config) => {
    // Add TypeScript and TSX extensions
    config.resolve.extensions.push(".ts", ".tsx");

    // Set fallback for 'fs' module
    config.resolve.fallback = { fs: false };

    // Add CopyPlugin for static assets
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/onnxruntime-web/dist/*.wasm",
            to: "static/chunks/[name][ext]",
          },
          {
            from: "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs",
            to: "static/chunks/[name][ext]",
          },
          {
            from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
            to: "static/chunks/[name][ext]",
          },
          {
            from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
            to: "static/chunks/[name][ext]",
          },
        ],
      })
    );

    return config;
  },
};

export default nextConfig;