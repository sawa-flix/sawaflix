import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
  webpack: (config, { webpack, isServer }) => {
    // Prisma 7.x generates ESM imports with .js extensions but files are .ts
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.js', '.ts'],
    };

    // Fix: sanity v5 imports `useEffectEvent` from 'react' as an ESM named
    // export. React 19 stable ships the export in its CJS build but the
    // package.json `exports` map doesn't enumerate named exports, so webpack's
    // static analyser reports it as "not exported".
    //
    // NormalModuleReplacementPlugin intercepts the import BEFORE webpack loads
    // and analyses the target module, redirecting sanity's react imports to our
    // CJS shim which explicitly re-exports all named APIs including useEffectEvent.
    // Only sanity/next-sanity/@ sanity imports are redirected — all other app
    // code keeps importing the real React.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^react$/,
        (resource) => {
          const ctx = resource.context || '';
          // Must use path.sep, not a hard-coded '/' — on Windows resource.context
          // is backslash-separated, so the forward-slash check here silently
          // never matched, the shim redirect never fired, and Sanity's real
          // (unpatched) React import went through, breaking the entire
          // production build with "'useEffectEvent' is not exported from 'react'".
          const isSanity =
            ctx.includes(`${path.sep}node_modules${path.sep}sanity`) ||
            ctx.includes(`${path.sep}node_modules${path.sep}next-sanity`) ||
            ctx.includes(`${path.sep}node_modules${path.sep}@sanity`);
          if (isSanity) {
            resource.request = path.resolve(__dirname, './lib/react-with-shim.cjs');
          }
        }
      )
    );

    return config;
  },

  transpilePackages: ["styled-components", "sanity", "next-sanity", "@sanity/ui", "@sanity/icons", "@sanity/image-url", "@portabletext/react"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.ibb.co',
      },
      {
        protocol: 'https',
        hostname: '**.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    dangerouslyAllowSVG: true,
    qualities: [75, 85, 90, 100],
  },
};

import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
