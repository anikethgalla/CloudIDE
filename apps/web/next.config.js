/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents duplicate mounts in xterm.js and monaco during development
  transpilePackages: ['@cloud-ide/shared'],
};

module.exports = nextConfig;
