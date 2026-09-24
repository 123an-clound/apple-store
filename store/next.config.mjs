import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xsspvdgnhelzprcqaiek.supabase.co';
const supabaseHost = new URL(SUPABASE_URL).hostname;

// Product images and the REST API both live on the Supabase host, so it has to be
// allow-listed for img-src and connect-src. Everything else is same-origin.
// 'unsafe-inline' on script-src is required by the inline theme-init script in
// app/layout.js (it must run before paint to avoid a light/dark flash); tightening
// this further would mean moving to nonces via middleware.
// 'unsafe-eval' is only needed by Turbopack's dev-mode HMR runtime — the production
// bundle never calls eval, so it's dropped outside development.
// 'wasm-unsafe-eval' lets the hero's meshopt GLB decoder compile its WebAssembly
// module; unlike 'unsafe-eval' it does not re-enable eval()/new Function().
const scriptSrc =
  process.env.NODE_ENV === 'production'
    ? "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${supabaseHost}`,
  "font-src 'self' data:",
  // GLTFLoader resolves images embedded in a GLB through same-document blob URLs.
  `connect-src 'self' blob: https://${supabaseHost}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework/version in every response.
  poweredByHeader: false,
  // A stray empty package-lock.json in the parent folder makes Next infer the wrong
  // workspace root. Pin it to this app.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Product shots are flat PNGs on a plain background — AVIF/WebP cut them down hard.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
