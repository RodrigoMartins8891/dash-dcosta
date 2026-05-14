import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/products/:path*",
        destination: "http://localhost:3001/products/:path*",
      },
      {
        source: "/orders/:path*",
        destination: "http://localhost:3001/orders/:path*",
      },
      {
        source: "/checkout/:path*",
        destination: "http://localhost:3001/checkout/:path*",
      },
    ];
  },
};

export default nextConfig;