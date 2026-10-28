import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ToastProvider, useToast } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { PropertyProvider } from "./context/PropertyContext";
import Agents from "./pages/landing/Agents";
import { userApi, inquiryApi } from "./services/api";
import * as sessionModule from "./utils/session";

jest.mock("./services/api", () => {
  const actual = jest.requireActual("./services/api");
  return {
    ...actual,
    userApi: {
      ...actual.userApi,
      getAgents: jest.fn(),
    },
    inquiryApi: {
      ...actual.inquiryApi,
      create: jest.fn(),
      getMyInquiries: jest.fn().mockResolvedValue([]),
    },
    propertyApi: {
      ...actual.propertyApi,
      getAll: jest.fn().mockResolvedValue([]),
      getMyProperties: jest.fn().mockResolvedValue([]),
    },
    appointmentApi: {
      ...actual.appointmentApi,
      getMyAppointments: jest.fn().mockResolvedValue([]),
    },
    wishlistApi: {
      ...actual.wishlistApi,
      getWishlist: jest.fn().mockResolvedValue([]),
    },
  };
});

const mockBuyerUser = {
  id: "buyer-99",
  _id: "buyer-99",
  name: "Pooja Sharma",
  email: "pooja@example.com",
  role: "Buyer",
  phone: "+91 98765 43210",
  token: "jwt-test-token",
};

// Test consumer component to verify toast types & confirmation dialog
const TestToastConsumer = ({ onActionDone }) => {
  const { toast, confirm } = useToast();

  const handleTestSuccess = () => {
    toast.success("Property saved to portfolio successfully!", "Operation Complete");
  };

  const handleTestError = () => {
    toast.error("Failed to connect to database.", "Network Error");
  };

  const handleTestWarning = () => {
    toast.warning("Please upload an image smaller than 5MB.", "File Notice");
  };

  const handleTestInfo = () => {
    toast.info("A seller account is required to publish listings.", "Account Type");
  };

  const handleTestDuplicateSpam = () => {
    toast.info("Repeated message text");
    toast.info("Repeated message text");
    toast.info("Repeated message text");
  };

  const handleDestructiveAction = async () => {
    const ok = await confirm({
      title: "Delete Property Listing",
      message: "Are you sure you want to permanently delete 'Skyline Penthouse'?",
      confirmText: "Delete Record",
      cancelText: "Keep Property",
      isDanger: true,
    });
    if (onActionDone) {
      onActionDone(ok);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <button onClick={handleTestSuccess}>Trigger Success Toast</button>
      <button onClick={handleTestError}>Trigger Error Toast</button>
      <button onClick={handleTestWarning}>Trigger Warning Toast</button>
      <button onClick={handleTestInfo}>Trigger Info Toast</button>
      <button onClick={handleTestDuplicateSpam}>Trigger Spam Toasts</button>
      <button onClick={handleDestructiveAction}>Trigger Delete Confirm</button>
    </div>
  );
};

describe("HomeHub — In-App Toast & Confirmation System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. Renders success toast with appropriate styling, title, and message", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger Success Toast"));

    const toastMessage = screen.getByText("Property saved to portfolio successfully!");
    expect(toastMessage).toBeInTheDocument();
    expect(screen.getByText("Operation Complete")).toBeInTheDocument();

    const toastElement = screen.getByRole("status");
    expect(toastElement).toBeInTheDocument();
  });

  test("2. Renders error toast with role='alert' and accessible dismiss button", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger Error Toast"));

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeInTheDocument();
    expect(screen.getByText("Failed to connect to database.")).toBeInTheDocument();

    // Close button dismisses the toast
    const closeBtn = screen.getByLabelText("Close notification");
    fireEvent.click(closeBtn);

    act(() => {
      jest.advanceTimersByTime?.(300);
    });
  });

  test("3. Renders warning and information toasts correctly", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger Warning Toast"));
    expect(screen.getByText("Please upload an image smaller than 5MB.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Trigger Info Toast"));
    expect(screen.getByText("A seller account is required to publish listings.")).toBeInTheDocument();
  });

  test("4. Deduplicates identical rapid toast notifications to prevent spam", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger Spam Toasts"));

    // Exactly one toast should exist despite 3 consecutive dispatches
    const matches = screen.getAllByText("Repeated message text");
    expect(matches).toHaveLength(1);
  });

  test("5. Confirmation dialog: cancels action when Cancel button or backdrop is clicked", async () => {
    const handleActionDone = jest.fn();

    render(
      <ToastProvider>
        <TestToastConsumer onActionDone={handleActionDone} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger Delete Confirm"));

    // Dialog is visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Property Listing")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to permanently delete/)).toBeInTheDocument();

    // Click Cancel
    const cancelBtn = screen.getByRole("button", { name: "Keep Property" });
    fireEvent.click(cancelBtn);

    // Confirm promise resolved with false
    await waitFor(() => {
      expect(handleActionDone).toHaveBeenCalledWith(false);
    });

    // Dialog is unmounted
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("6. Confirmation dialog: executes action only when Confirm button is clicked", async () => {
    const handleActionDone = jest.fn();

    render(
      <ToastProvider>
        <TestToastConsumer onActionDone={handleActionDone} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger Delete Confirm"));

    const confirmBtn = screen.getByRole("button", { name: "Delete Record" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleActionDone).toHaveBeenCalledWith(true);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("HomeHub — Inquiry Workflow (Contact Advisor)", () => {
  const mockAgent = {
    _id: "agent-007",
    name: "Meet Patel",
    email: "meet@example.com",
    role: "agent",
    agencyName: "Patel Real Estate",
    reraId: "PR/GJ/AHM/001",
    region: "Ahmedabad",
    propertiesCount: 4,
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();
    userApi.getAgents.mockResolvedValue([mockAgent]);
  });

  test("1. When logged in, Contact Advisor sends inquiry to backend and shows success toast upon confirmation", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyerUser);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("jwt-test-token");
    inquiryApi.create.mockResolvedValue({ _id: "inq-123", status: "Pending" });

    render(
      <ToastProvider>
        <AuthProvider>
          <PropertyProvider>
            <Agents />
          </PropertyProvider>
        </AuthProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Meet Patel")).toBeInTheDocument();
    });

    const contactBtn = screen.getByRole("button", { name: /Contact Advisor/i });
    fireEvent.click(contactBtn);

    // Verify backend inquiry API was called
    await waitFor(() => {
      expect(inquiryApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: "agent-007",
        })
      );
    });

    // Verify polished success toast with required exact message
    await waitFor(() => {
      expect(
        screen.getByText("Inquiry sent successfully! The advisor can now review your request.")
      ).toBeInTheDocument();
    });

    // Verify no unconfirmed phone contact claim is displayed in the toast
    expect(screen.queryByText(/registered contact number/i)).not.toBeInTheDocument();
  });

  test("2. When backend inquiry request fails, shows error toast and NEVER shows success toast", async () => {
    jest.spyOn(sessionModule, "getSessionUser").mockReturnValue(mockBuyerUser);
    jest.spyOn(sessionModule, "getSessionToken").mockReturnValue("jwt-test-token");
    inquiryApi.create.mockRejectedValue(new Error("Database connection timed out"));

    render(
      <ToastProvider>
        <AuthProvider>
          <PropertyProvider>
            <Agents />
          </PropertyProvider>
        </AuthProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Meet Patel")).toBeInTheDocument();
    });

    const contactBtn = screen.getByRole("button", { name: /Contact Advisor/i });
    fireEvent.click(contactBtn);

    // Error toast should appear
    await waitFor(() => {
      expect(screen.getByText("Database connection timed out")).toBeInTheDocument();
    });

    // Success toast must NEVER appear
    expect(
      screen.queryByText("Inquiry sent successfully! The advisor can now review your request.")
    ).not.toBeInTheDocument();
  });
});
