import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        allowedDevOrigins: ["fantastic-invention-grjjwv45g9v2wwg5-3000.app.github.dev", "localhost:3000"],
    },
    serverExternalPackages: ["@prisma/client", "bcryptjs", "otplib", "nodemailer"],
};

export default nextConfig;
