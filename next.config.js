const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '/**',
            },
        ],
    },
    sassOptions: {
        implementation: 'sass-embedded',
    },
};

module.exports = nextConfig;
