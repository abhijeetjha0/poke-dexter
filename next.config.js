const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/poke-dexter' : '',
  images: {
    unoptimized: true,
  },
  sassOptions: {
    implementation: 'sass-embedded',
  },
}

module.exports = nextConfig
