import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Agents from "./pages/landing/Agents";
import { AuthProvider } from "./context/AuthContext";
import { PropertyProvider } from "./context/PropertyContext";
import { userApi } from "./services/api";

jest.mock("./services/api", () => {
  const actual = jest.requireActual("./services/api");
  return {
    ...actual,
    userApi: {
      ...actual.userApi,
      getAgents: jest.fn(),
    },
  };
});

describe("Agents Page — Genuine Data & Deduplication", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("deduplicates repeated agent records and displays genuine advisor details", async () => {
    // Mock API returning duplicated records
    userApi.getAgents.mockResolvedValue([
      {
        _id: "6adf4f55ec45761e94dc9aa0",
        name: "meet",
        email: "meet@gmail.com",
        role: "agent",
        agencyName: "Patel Realstate Pvt. Ltd.",
        reraId: "PR/GJ/AHEMEDABAD/0215",
        region: "Ahmedabad",
        propertiesCount: 2,
      },
      {
        _id: "6adf4f55ec45761e94dc9aa0", // Duplicate entry with identical _id
        name: "meet",
        email: "meet@gmail.com",
        role: "agent",
        agencyName: "Patel Realstate Pvt. Ltd.",
        reraId: "PR/GJ/AHEMEDABAD/0215",
        region: "Ahmedabad",
        propertiesCount: 2,
      },
    ]);

    render(
      <BrowserRouter>
        <AuthProvider>
          <PropertyProvider>
            <Agents />
          </PropertyProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify loading state transitions to resolved agent
    await waitFor(() => {
      expect(screen.getByText("meet")).toBeInTheDocument();
    });

    // Exactly one agent card should exist (deduplicated)
    const agentNames = screen.getAllByText("meet");
    expect(agentNames).toHaveLength(1);

    expect(screen.getByText("Patel Realstate Pvt. Ltd.")).toBeInTheDocument();
    expect(screen.getByText(/PR\/GJ\/AHEMEDABAD\/0215/)).toBeInTheDocument();
    expect(screen.getByText(/2 Managed Portfolios/)).toBeInTheDocument();
  });

  test("shows empty state when filtering by a region with no registered agents", async () => {
    userApi.getAgents.mockResolvedValue([
      {
        _id: "6adf4f55ec45761e94dc9aa0",
        name: "meet",
        agencyName: "Patel Realstate Pvt. Ltd.",
        region: "Ahmedabad",
        reraId: "PR/GJ/AHEMEDABAD/0215",
      },
    ]);

    render(
      <BrowserRouter>
        <AuthProvider>
          <PropertyProvider>
            <Agents />
          </PropertyProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("meet")).toBeInTheDocument();
    });

    // Filter by Surat
    const select = screen.getByLabelText(/Filter advisors by city/i);
    fireEvent.change(select, { target: { value: "Surat" } });

    // Empty state should appear
    expect(screen.getByText("No Certified Advisors Found")).toBeInTheDocument();
    expect(screen.queryByText("meet")).not.toBeInTheDocument();

    // Resetting filter restores the agent
    const resetBtn = screen.getByRole("button", { name: /View All Regions/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText("meet")).toBeInTheDocument();
  });
});
