import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import * as sessionModule from "./utils/session";
import { authApi, propertyApi, wishlistApi, inquiryApi, appointmentApi, visitorApi, notificationApi } from "./services/api";

// Mock API requests
jest.mock("./services/api", () => ({
  authApi: {
    getProfile: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
  propertyApi: {
    getAll: jest.fn(),
    getMyProperties: jest.fn(),
    getFeatured: jest.fn(),
  },
  wishlistApi: {
    getWishlist: jest.fn(),
    getUserWishlist: jest.fn(),
  },
  inquiryApi: {
    getMyInquiries: jest.fn(),
  },
  appointmentApi: {
    getMyAppointments: jest.fn(),
  },
  visitorApi: {
    logVisit: jest.fn(),
  },
  userApi: {
    updateMe: jest.fn(),
  },
  notificationApi: {
    getMyNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

const renderAppAt = (route = "/") => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
};

describe("HomeHub — Initial Page and Landing Page Routing", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();

    // Default mock implementations returning promises
    authApi.getProfile.mockResolvedValue({ data: null });
    authApi.login.mockResolvedValue({ data: null });
    authApi.register.mockResolvedValue({ data: null });
    propertyApi.getAll.mockResolvedValue([]);
    propertyApi.getMyProperties.mockResolvedValue([]);
    propertyApi.getFeatured.mockResolvedValue([]);
    wishlistApi.getWishlist.mockResolvedValue({ wishlist: [] });
    wishlistApi.getUserWishlist.mockResolvedValue({ wishlist: [] });
    inquiryApi.getMyInquiries.mockResolvedValue({ inquiries: [] });
    appointmentApi.getMyAppointments.mockResolvedValue({ appointments: [] });
    visitorApi.logVisit.mockResolvedValue({ success: true });
    notificationApi.getMyNotifications.mockResolvedValue([]);
    notificationApi.getUnreadCount.mockResolvedValue(0);
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("1. When logged out, root URL '/' displays the public HomeHub landing page and Login/Sign Up buttons", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(null);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue(null);

    renderAppAt("/");

    // Branding is rendered
    expect(screen.getByText("Real Estate Marketplace")).toBeInTheDocument();

    // Public navigation items are present
    const homeLinks = screen.getAllByRole("link", { name: /^home$/i });
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /^buy$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^rent$/i })).toBeInTheDocument();

    // Login and Sign Up buttons are visible
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  test("2. When logged in as Buyer, opening root URL '/' displays the public landing page and does NOT redirect away", async () => {
    const mockBuyer = {
      id: "buyer-123",
      _id: "buyer-123",
      name: "Rohit Sharma",
      email: "rohit@example.com",
      role: "Buyer",
      token: "mock-buyer-jwt-token",
    };
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyer);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("mock-buyer-jwt-token");
    authApi.getProfile.mockResolvedValue({ data: mockBuyer });

    renderAppAt("/");

    // Landing page headline or brand is visible
    expect(screen.getByText("Real Estate Marketplace")).toBeInTheDocument();

    // Home link is still available and visible in the navigation
    const homeLinks = screen.getAllByRole("link", { name: /^home$/i });
    expect(homeLinks.length).toBeGreaterThan(0);

    // Dashboard quick link is visible
    expect(screen.getByTitle(/open dashboard/i)).toBeInTheDocument();

    // User profile button shows user's name and role
    expect(screen.getByLabelText(/user profile menu/i)).toBeInTheDocument();
    expect(screen.getByText("Rohit Sharma")).toBeInTheDocument();
    expect(screen.getByText("Buyer")).toBeInTheDocument();
  });

  test("3. When logged in as Buyer, clicking the profile dropdown shows user profile menu options", async () => {
    const mockBuyer = {
      id: "buyer-123",
      _id: "buyer-123",
      name: "Rohit Sharma",
      email: "rohit@example.com",
      role: "Buyer",
      token: "mock-buyer-jwt-token",
    };
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyer);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("mock-buyer-jwt-token");
    authApi.getProfile.mockResolvedValue({ data: mockBuyer });

    renderAppAt("/");

    const profileButton = screen.getByLabelText(/user profile menu/i);
    fireEvent.click(profileButton);

    // Dropdown contains dashboard link, profile settings, and logout
    expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/profile & account settings/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  test("4. When logged in as Agent, root URL '/' shows Home page with Agent dashboard link", async () => {
    const mockAgent = {
      id: "agent-456",
      _id: "agent-456",
      name: "Pooja Mehta",
      email: "pooja@realty.com",
      role: "Agent",
      token: "mock-agent-jwt-token",
    };
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockAgent);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("mock-agent-jwt-token");
    authApi.getProfile.mockResolvedValue({ data: mockAgent });

    renderAppAt("/");

    expect(screen.getByText("Real Estate Marketplace")).toBeInTheDocument();
    expect(screen.getByTitle(/open dashboard/i)).toBeInTheDocument();
    expect(screen.getByText("Pooja Mehta")).toBeInTheDocument();
    expect(screen.getByText("Agent")).toBeInTheDocument();
  });

  test("5. When logged in as Seller, root URL '/' shows Home page with Seller dashboard link", async () => {
    const mockSeller = {
      id: "seller-789",
      _id: "seller-789",
      name: "Vikram Patel",
      email: "vikram@example.com",
      role: "Seller",
      token: "mock-seller-jwt-token",
    };
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockSeller);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("mock-seller-jwt-token");
    authApi.getProfile.mockResolvedValue({ data: mockSeller });

    renderAppAt("/");

    expect(screen.getByText("Real Estate Marketplace")).toBeInTheDocument();
    expect(screen.getByTitle(/open dashboard/i)).toBeInTheDocument();
    expect(screen.getByText("Vikram Patel")).toBeInTheDocument();
    expect(screen.getByText("Seller")).toBeInTheDocument();
  });

  test("6. When logged in as Admin, root URL '/' shows Home page with Admin Console link", async () => {
    const mockAdmin = {
      id: "admin-999",
      _id: "admin-999",
      name: "Super Admin",
      email: "admin@homehub.com",
      role: "admin",
      token: "mock-admin-jwt-token",
    };
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockAdmin);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("mock-admin-jwt-token");
    authApi.getProfile.mockResolvedValue({ data: mockAdmin });

    renderAppAt("/");

    expect(screen.getByText("Real Estate Marketplace")).toBeInTheDocument();
    expect(screen.getByTitle(/open admin console/i)).toBeInTheDocument();
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  test("7. Navigating directly to /buy or /rent works as public routes", async () => {
    renderAppAt("/buy");
    const buyTitles = screen.getAllByText("Real Estate Marketplace");
    expect(buyTitles.length).toBeGreaterThan(0);

    cleanup();

    renderAppAt("/rent");
    const rentTitles = screen.getAllByText("Real Estate Marketplace");
    expect(rentTitles.length).toBeGreaterThan(0);
  });

  test("8. Unauthenticated access to /admin/dashboard redirects to /login", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(null);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue(null);

    renderAppAt("/admin/dashboard");

    // Redirected to Login page
    await waitFor(() => {
      expect(screen.getByText(/client & admin portal/i)).toBeInTheDocument();
    });
  });

  test("9. Unauthenticated access to /dashboard redirects to /login", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(null);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue(null);

    renderAppAt("/dashboard");

    await waitFor(() => {
      expect(screen.getByText(/client & admin portal/i)).toBeInTheDocument();
    });
  });
});
