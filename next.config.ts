import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        allowedDevOrigins: ["http://localhost:3000", "https://fantastic-invention-grjjwv45g9v2wwg5-3000.app.github.dev"],
    }
};

export default nextConfig;
