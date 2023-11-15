/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    return config;
  },
  env: {
    NEXT_PUBLIC_TBA_KEY: process.env.NEXT_PUBLIC_TBA_KEY,
  },
};
