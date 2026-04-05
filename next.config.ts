/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb', // Set this higher than your 10MB check
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xjxbjnjspmmpfngbdihd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow private IPs for Supabase storage in development
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; img-src 'self' blob: data: https://xjxbjnjspmmpfngbdihd.supabase.co https://lh3.googleusercontent.com https://images.unsplash.com https://i.ibb.co; script-src 'none'; sandbox;",
  },
}
export default nextConfig;

module.exports = nextConfig

