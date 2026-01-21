/** @type {import('next').NextConfig} */
const nextConfig = {
  // Зурагтай холбоотой тохиргоо
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.edaatgal.mn",
      },
      {
        protocol: "https",
        hostname: "edaatgal.mn",
      },
      {
        protocol: "https",
        hostname: "qpay.mn",
      },
      {
        protocol: "https",
        hostname: "s3.qpay.mn",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "scontent.fuln1-1.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "scontent.fuln1-2.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        pathname: "/demos/**",
      },
      {
        protocol: "https",
        hostname: "admin.edaatgal.mn",
        pathname: "/storage/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://admin.edaatgal.mn https://edaatgal.mn https://qpay.mn https://s3.qpay.mn https://odoo.tengerinsurance.mn https://*.edaatgal.mn https://*.qpay.mn https://*.tengerinsurance.mn; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
