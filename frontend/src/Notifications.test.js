import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import * as sessionModule from "./utils/session";
import {
  authApi,
  propertyApi,
  wishlistApi,
  inquiryApi,
  appointmentApi,
  visitorApi,
  notificationApi,
} from "./services/api";

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

const mockBuyer = {
  id: "buyer-001",
  _id: "buyer-001",
  name: "Arjun Verma",
  email: "arjun@example.com",
  role: "Buyer",
  token: "jwt-buyer-token",
};

const mockNotifications = [
  {
    _id: "notif-1",
    id: "notif-1",
    type: "offer_accepted",
    title: "Offer Accepted!",
    message: "Congratulations! Your offer of ₹1.5 Cr for 'Sobha Dream Acres' has been accepted.",
    property: { _id: "prop-101", title: "Sobha Dream Acres" },
    propertyTitle: "Sobha Dream Acres",
    resourceType: "offer",
    resourceId: "offer-1",
    link: "/buyer/offers",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "notif-2",
    id: "notif-2",
    type: "inquiry_replied",
    title: "Inquiry Response Received",
    message: "Advisor responded to your inquiry on 'Prestige Golfshire': 'Yes, villa #14 is available.'",
    property: { _id: "prop-102", title: "Prestige Golfshire" },
    propertyTitle: "Prestige Golfshire",
    resourceType: "inquiry",
    resourceId: "inquiry-2",
    link: "/buyer/inquiries",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "notif-3",
    id: "notif-3",
    type: "appointment_confirmed",
    title: "Site Visit Confirmed!",
    message: "Your site visit for 'Godrej Woods' has been confirmed for 2026-11-01 at 10:00 AM.",
    property: { _id: "prop-103", title: "Godrej Woods" },
    propertyTitle: "Godrej Woods",
    resourceType: "appointment",
    resourceId: "appt-3",
    link: "/buyer/visits",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const renderAppAt = (route = "/") => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
};

describe("HomeHub — In-App Notification Center Integration", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();

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

    notificationApi.getMyNotifications.mockResolvedValue(mockNotifications);
    notificationApi.getUnreadCount.mockResolvedValue(2);
    notificationApi.markAsRead.mockResolvedValue({ success: true });
    notificationApi.markAllAsRead.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("1. When logged out, notification bell is not rendered on public navbar", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(null);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue(null);

    renderAppAt("/");

    expect(screen.queryByLabelText(/notifications/i)).not.toBeInTheDocument();
  });

  test("2. When logged in, notification bell is rendered with correct unread count badge", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyer);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("jwt-buyer-token");
    authApi.getProfile.mockResolvedValue({ data: mockBuyer });

    renderAppAt("/");

    // Notification bell button is visible
    const bellBtn = await screen.findByLabelText(/notifications/i);
    expect(bellBtn).toBeInTheDocument();

    // Badge showing 2 unread notifications
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  test("3. Clicking notification bell opens dropdown with notification messages and properties", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyer);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("jwt-buyer-token");
    authApi.getProfile.mockResolvedValue({ data: mockBuyer });

    renderAppAt("/");

    const bellBtn = await screen.findByLabelText(/notifications/i);
    fireEvent.click(bellBtn);

    // Dropdown header
    expect(screen.getByRole("region", { name: /notification center/i })).toBeInTheDocument();
    expect(screen.getByText(/2 new/i)).toBeInTheDocument();

    // Notifications are displayed
    expect(screen.getByText("Offer Accepted!")).toBeInTheDocument();
    expect(screen.getByText(/Congratulations! Your offer of ₹1.5 Cr/i)).toBeInTheDocument();
    expect(screen.getByText("Sobha Dream Acres")).toBeInTheDocument();

    expect(screen.getByText("Inquiry Response Received")).toBeInTheDocument();
    expect(screen.getByText("Site Visit Confirmed!")).toBeInTheDocument();
  });

  test("4. Clicking 'Mark all read' calls API and clears unread badge", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyer);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("jwt-buyer-token");
    authApi.getProfile.mockResolvedValue({ data: mockBuyer });

    renderAppAt("/");

    const bellBtn = await screen.findByLabelText(/notifications/i);
    fireEvent.click(bellBtn);

    const markAllBtn = screen.getByText(/mark all read/i);
    fireEvent.click(markAllBtn);

    expect(notificationApi.markAllAsRead).toHaveBeenCalled();
  });

  test("5. Shows empty state message when user has zero notifications", async () => {
    notificationApi.getMyNotifications.mockResolvedValue([]);
    notificationApi.getUnreadCount.mockResolvedValue(0);

    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyer);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("jwt-buyer-token");
    authApi.getProfile.mockResolvedValue({ data: mockBuyer });

    renderAppAt("/");

    const bellBtn = await screen.findByLabelText(/notifications/i);
    fireEvent.click(bellBtn);

    expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument();
  });
});
