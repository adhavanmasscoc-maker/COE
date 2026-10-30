/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/exams/questions/:path*",
        destination: "/questions/exams/:path*",
      },
    ];
  },
};

export default nextConfig;
