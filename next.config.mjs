/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.pomonabatangas.com/:path*",
      },
    ];
  },
  images: {
    domains: ["localhost", "api.pomonabatangas.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.pomonabatangas.com",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
