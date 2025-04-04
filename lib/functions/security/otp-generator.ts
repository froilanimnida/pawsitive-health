import { totp } from "@otplib/preset-v11";
import crypto from "crypto";

// Generate a unique secret for each user based on their email
export const generateSecret = (email: string): string => {
    return crypto
        .createHash("sha256")
        .update(`${email}${process.env.OTP_SECRET_KEY || "default-secret"}`)
        .digest("hex");
};

// Generate a time-based OTP using the user's secret
export const generateOtp = (email: string): string => {
    const secret = generateSecret(email);
    return totp.generate(secret);
};

// Verify the OTP token
export const verifyOTPToken = (token: string, email: string): boolean => {
    const secret = generateSecret(email);
    return totp.verify({ token, secret });
};
