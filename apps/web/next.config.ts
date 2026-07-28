import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tft/transformation-schema', '@tft/transformation-engine'],
  poweredByHeader: false,
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
