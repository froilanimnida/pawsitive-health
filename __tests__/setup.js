// Add extended Jest matchers
require("@testing-library/jest-dom");

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
