/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.pexels.com'
        }
      ]
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
          config.externals.push({
            '@tensorflow/tfjs-node': 'commonjs2 @tensorflow/tfjs-node',
            'node-gyp': 'commonjs2 node-gyp'
          });
        }
        return config;
    }, experimental: {
        serverExternalPackages: ['@tensorflow/tfjs-node'],
      },
      async rewrites() {
      return [
        {
          source: '/api/predict',
          destination: 'http://127.0.0.1:5000/predict',
        },
      ]
    },
  }
  
  module.exports = nextConfig;