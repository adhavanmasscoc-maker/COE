/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // QB short URLs → actual student routes (fixes /qb/12/math 404 on Vercel)
      { source: "/qb/12/math",         destination: "/student/qb/12/math",    permanent: false },
      { source: "/qb/12/maths",        destination: "/student/qb/12/math",    permanent: false },
      { source: "/qb/12/physics",      destination: "/student/qb/12/physics", permanent: false },
      { source: "/qb/:grade/:sub",     destination: "/student/qb/:grade/:sub",permanent: false },
    ];
  },
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
