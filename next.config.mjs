/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from preview tools in dev
  allowedDevOrigins: ['127.0.0.1'],

  images: {
    // Keep unoptimized for local dev; on Vercel the optimizer runs automatically
    unoptimized: process.env.NODE_ENV !== 'production',
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Force HTTPS (1 year, include subdomains)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Restrict referrer info on cross-origin requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not needed by this site
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Extra cache-control for admin routes — never cache
        source: '/admin/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },
}

export default nextConfig
