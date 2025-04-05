import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        allowedDevOrigins: ["fantastic-invention-grjjwv45g9v2wwg5-3000.app.github.dev", "localhost:3000"],
    },
    serverExternalPackages: ["@prisma/client", "bcryptjs", "otplib", "nodemailer"],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                dns: false,
            };
        }
        return config;
    },
};

export default nextConfig;
