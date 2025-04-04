import jwt from "jsonwebtoken";
export const generateVerificationToken = (email: string): string => {
    const token = jwt.sign({ email }, process.env.SECRET || "fallback-secret-key", {
        expiresIn: 604800000,
    });
    return token;
};
