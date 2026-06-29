/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude other app folders that live in the same repo root
  transpilePackages: [],
  typescript: {
    // Only type-check the TA dashboard files, not dulzs-hub
    ignoreBuildErrors: false,
  },
  // Tell webpack to ignore the dulzs-hub subfolder
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/dulzs-hub/**', '**/node_modules/**'],
    };
    return config;
  },
};

module.exports = nextConfig;
