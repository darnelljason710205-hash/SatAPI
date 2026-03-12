/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            crypto: false,
            stream: false,
            url: false,
            zlib: false,
            http: false,
            https: false,
            assert: false,
            os: false,
            path: false,
            buffer: false,
        };
        return config;
    },
};

export default nextConfig;
