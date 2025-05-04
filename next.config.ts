import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ["fantastic-invention-grjjwv45g9v2wwg5-3000.app.github.dev", "localhost:3000"],
    serverExternalPackages: ["@prisma/client", "bcryptjs", "otplib", "nodemailer"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pawsitive.b700c33a8dd77e29da09cb700c5c6959.r2.cloudflarestorage.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
