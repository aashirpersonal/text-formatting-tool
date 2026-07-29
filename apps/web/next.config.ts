import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tft/transformation-schema', '@tft/transformation-engine'],
  serverExternalPackages: ['openai'],
  poweredByHeader: false,
  // Next.js 16 blocks cross-origin access to /_next/* (including HMR) by default.
  // Without this, opening the app via http://127.0.0.1:3000 (or a LAN IP) serves HTML
  // but never hydrates. localhost remains allowed by default.
  allowedDevOrigins: [
    '127.0.0.1',
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(',')
      .map((value) => value.trim())
      .filter(Boolean) ?? []),
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;

// Enable Cloudflare bindings access during `next dev` when using OpenNext.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();
