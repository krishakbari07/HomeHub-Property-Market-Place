import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Mock api/api
jest.mock("./api/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
  API_BASE_URL: "http://localhost:5000/api",
}));

// Mock AuthContext
jest.mock("./context/AuthContext", () => ({
  __esModule: true,
  useAuth: () => ({
    user: { id: "admin1", name: "Admin User", role: "admin" },
    logout: jest.fn(),
  }),
}));

import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import AdminOffers from "./pages/dashboard/admin/AdminOffers";

describe("Admin Dashboard and Sub-views", () => {
  test("renders AdminOffers component standalone", () => {
    render(
      <BrowserRouter>
        <AdminOffers />
      </BrowserRouter>
    );
  });

  const views = ["dashboard", "users", "properties", "appointments", "inquiries", "offers", "analytics", "settings"];
  views.forEach((v) => {
    test(`renders AdminDashboard view='${v}'`, () => {
      render(
        <BrowserRouter>
          <AdminDashboard view={v} />
        </BrowserRouter>
      );
    });
  });
});
