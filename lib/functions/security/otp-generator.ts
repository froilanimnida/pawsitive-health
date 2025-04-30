import { totp } from "@otplib/preset-v11";
import { sha256Hash } from "@/lib";

// Generate a unique secret for each user based on their email
export const generateSecret = async (email: string): Promise<string> => {
    return await sha256Hash(`${email}${process.env.OTP_SECRET_KEY || "default-secret"}`);
};

// Generate a time-based OTP using the user's secret
export const generateOtp = async (email: string): Promise<string> => {
    const secret = await generateSecret(email);
    return totp.generate(secret);
};

// Verify the OTP token
export const verifyOTPToken = async (token: string, email: string): Promise<boolean> => {
    const secret = await generateSecret(email);
    return totp.verify({ token, secret });
};
