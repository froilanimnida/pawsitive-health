import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

// Create a mock PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Mock the prisma module
jest.mock("../../lib/prisma", () => ({
    prisma: prismaMock,
}));

// Mock the auth session
export const mockSession = {
    user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        image: "https://example.com/image.jpg",
        role: "user",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockVetSession = {
    user: {
        id: "2",
        email: "vet@example.com",
        name: "Test Vet",
        image: "https://example.com/vet.jpg",
        role: "veterinarian",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAdminSession = {
    user: {
        id: "test-admin-id",
        email: "admin@example.com",
        name: "Test Admin",
        role: "ADMIN",
    },
};

export const mockClinicSession = {
    user: {
        id: "3",
        email: "clinic@example.com",
        name: "Test Clinic",
        image: "https://example.com/clinic.jpg",
        role: "client",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock the next-auth getServerSession function
jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

// Mock R2 service
export const r2ServiceMock = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
};

jest.mock("../../lib/r2-service", () => ({
    uploadFile: r2ServiceMock.uploadFile,
    getFileUrl: r2ServiceMock.getFileUrl,
    deleteFile: r2ServiceMock.deleteFile,
}));

// Mock notification service
export const notificationServiceMock = {
    sendNotification: jest.fn(),
    scheduleNotification: jest.fn(),
};

jest.mock("../../lib/notification-service", () => ({
    sendNotification: notificationServiceMock.sendNotification,
    scheduleNotification: notificationServiceMock.scheduleNotification,
}));

// Mock email service
export const emailServiceMock = {
    sendEmail: jest.fn(),
};

jest.mock("../../lib/email-service", () => ({
    sendEmail: emailServiceMock.sendEmail,
}));

// Reset mocks between tests
beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
});

// Add a minimal test to avoid Jest warnings
describe("mocks", () => {
    it("should exist", () => {
        expect(prismaMock).toBeDefined();
        expect(mockSession).toBeDefined();
        expect(mockVetSession).toBeDefined();
        expect(mockClinicSession).toBeDefined();
    });
});
