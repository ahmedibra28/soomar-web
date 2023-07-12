/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'ui-avatars.com',
      'github.com',
      'ims-space.sgp1.cdn.digitaloceanspaces.com',
      'sahalbook.sgp1.cdn.digitaloceanspaces.com',
      'ahmedibra.com'
    ],
  },
}

module.exports = nextConfig
