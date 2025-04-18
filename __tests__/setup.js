// Add polyfills for TextEncoder/TextDecoder for react-email/render
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add extended Jest matchers
import { jest, beforeEach } from "@jest/globals";
import { prismaMock } from "./utils/mocks"; // Adjust path if needed

jest.mock("@/lib", () => ({
    // Or jest.mock('@/lib/prisma', ...) depending on your import
    __esModule: true,
    prisma: prismaMock,
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    }),
    usePathname: jest.fn().mockReturnValue("/"),
    useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Mock next-auth
jest.mock("next-auth", () => ({
    getServerSession: jest.fn().mockResolvedValue({
        user: {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
            role: "user",
        },
    }),
}));

// Global mocks for fetch
global.fetch = jest.fn();

// Reset all mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});
