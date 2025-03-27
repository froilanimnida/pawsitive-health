import { randomBytes } from 'crypto';
export const urlTokenGenerator = (length = 256) => randomBytes(length).toString('base64url').slice(0, length);
