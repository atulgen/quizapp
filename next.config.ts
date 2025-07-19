/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rxo5hd130p.ufs.sh',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig