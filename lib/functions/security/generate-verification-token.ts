import jwt from "jsonwebtoken";
export const generateVerificationToken = (email: string): string => {
    const token = jwt.sign({ email }, process.env.EMAIL_VERIFICATION_SECRET as string, {
        expiresIn: 604800000,
    });
    return token;
};
