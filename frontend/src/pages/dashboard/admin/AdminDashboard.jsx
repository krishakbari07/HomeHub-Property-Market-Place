import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminProperties from "./AdminProperties";
import AdminAppointments from "./AdminAppointments";
import AdminInquiries from "./AdminInquiries";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";
import AdminOffers from "./AdminOffers";
import AdminUserModal from "../../../components/admin/AdminUserModal";
import AdminPropertyModal from "../../../components/admin/AdminPropertyModal";
import AdminInquiryModal from "../../../components/admin/AdminInquiryModal";
import AdminConfirmDialog from "../../../components/admin/AdminConfirmDialog";
import { useToast } from "../../../context/ToastContext";

import {
  userApi,
  propertyApi,
  inquiryApi,
  appointmentApi,
  visitorApi,
  offerApi,
} from "../../../services/api";

export default function AdminDashboard({ view = null, initialAddProperty = false }) {
  const location = useLocation();
  const { toast } = useToast();

  // Primary dataset states
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [offers, setOffers] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [visitorStats, setVisitorStats] = useState({
    totalViews: 0,
    loggedInCount: 0,
    guestCount: 0,
    uniqueIps: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [defaultUserRole, setDefaultUserRole] = useState("buyer");
  const [submittingUser, setSubmittingUser] = useState(false);

  const [propertyModalOpen, setPropertyModalOpen] = useState(initialAddProperty);
  const [editingProperty, setEditingProperty] = useState(null);
  const [defaultPropertyPurpose, setDefaultPropertyPurpose] = useState("buy");
  const [submittingProperty, setSubmittingProperty] = useState(false);

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    isDanger: true,
    action: null,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Resolve current active view from prop or pathname
  const activeView = useMemo(() => {
    if (view) return view;
    const path = location.pathname.toLowerCase();
    if (path.includes("/users")) return "users";
    if (path.includes("/properties") || path.includes("/add-property")) return "properties";
    if (path.includes("/appointments")) return "appointments";
    if (path.includes("/inquiries")) return "inquiries";
    if (path.includes("/offers")) return "offers";
    if (path.includes("/analytics") || path.includes("/visitors")) return "analytics";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  }, [view, location.pathname]);

  // Load all admin data from authentic MongoDB endpoints
  const loadAllAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [uRes, pRes, iRes, aRes, vRes, oRes] = await Promise.all([
        userApi.getAllUsers().catch((err) => {
          console.error("Users API error:", err);
          return [];
        }),
        propertyApi.getAll().catch((err) => {
          console.error("Properties API error:", err);
          return [];
        }),
        inquiryApi.getAllInquiries().catch((err) => {
          console.error("Inquiries API error:", err);
          return [];
        }),
        appointmentApi.getAllAppointments().catch((err) => {
          console.error("Appointments API error:", err);
          return [];
        }),
        visitorApi.getAllVisitorLogs().catch((err) => {
          console.error("Visitor logs API error:", err);
          return { logs: [], stats: {} };
        }),
        offerApi.getAdminOffers().catch((err) => {
          console.error("Admin offers API error:", err);
          return [];
        }),
      ]);

      const uList = Array.isArray(uRes) ? uRes : uRes.data || uRes.users || [];
      const pList = Array.isArray(pRes) ? pRes : pRes.data || pRes.properties || [];
      const iList = Array.isArray(iRes) ? iRes : iRes.data || iRes.inquiries || [];
      const aList = Array.isArray(aRes) ? aRes : aRes.data || aRes.appointments || [];
      const oList = Array.isArray(oRes) ? oRes : oRes.data || [];

      setUsers(uList);
      setProperties(pList);
      setInquiries(iList);
      setAppointments(aList);
      setOffers(oList);

      if (vRes && vRes.logs) {
        setVisitorLogs(vRes.logs);
        setVisitorStats(
          vRes.stats || {
            totalViews: vRes.logs.length,
            loggedInCount: vRes.logs.filter((l) => l.isLoggedIn).length,
            guestCount: vRes.logs.filter((l) => !l.isLoggedIn).length,
            uniqueIps: new Set(vRes.logs.map((l) => l.ipAddress)).size,
          }
        );
      }
    } catch (err) {
      console.error("Failed to load admin dataset:", err);
      setError(err.response?.data?.message || err.message || "Failed to load system dataset");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  const showNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4500);
  };

  // --- USER ACTIONS ---
  const handleOpenUserModal = (targetUser = null, defaultRole = "buyer") => {
    setEditingUser(targetUser);
    setDefaultUserRole(defaultRole);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (formData) => {
    setSubmittingUser(true);
    try {
      if (editingUser) {
        const uid = editingUser._id || editingUser.id;
        await userApi.updateUser(uid, formData);
        showNotification(`User account for "${formData.name}" updated successfully.`);
      } else {
        await userApi.createUser(formData);
        showNotification(`New ${formData.role.toUpperCase()} "${formData.name}" created successfully.`);
      }
      setUserModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      toast.error("Failed to save user: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await userApi.updateUser(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: newRole } : u))
      );
      showNotification(`User authorization role updated to "${newRole.toUpperCase()}".`);
    } catch (err) {
      toast.error("Failed to update role: " + err.message);
    }
  };

  const handleDeleteUserPrompt = (userId, userName, role = "") => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete User: ${userName}`,
      message: `Are you sure you want to permanently delete user "${userName}"${
        role ? ` (${role.toUpperCase()})` : ""
      }? This action removes their access and cannot be undone.`,
      confirmText: "Delete Account",
      isDanger: true,
      action: async () => {
        setConfirmLoading(true);
        try {
          await userApi.deleteUser(userId);
          setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
          showNotification(`User "${userName}" deleted successfully.`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error("Failed to delete user: " + (err.response?.data?.message || err.message));
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  // --- PROPERTY ACTIONS ---
  const handleOpenPropertyModal = (targetProp = null, defaultPurpose = "buy") => {
    setEditingProperty(targetProp);
    setDefaultPropertyPurpose(defaultPurpose);
    setPropertyModalOpen(true);
  };

  const handleSaveProperty = async (formData) => {
    setSubmittingProperty(true);
    try {
      if (editingProperty) {
        const pid = editingProperty._id || editingProperty.id;
        await propertyApi.update(pid, formData);
        showNotification(`Property listing "${formData.title}" updated.`);
      } else {
        await propertyApi.create(formData);
        showNotification(`New listing "${formData.title}" added to marketplace.`);
      }
      setPropertyModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      toast.error("Failed to save property: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingProperty(false);
    }
  };

  const handleDeletePropertyPrompt = (propertyId, propertyTitle) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Property Listing`,
      message: `Are you sure you want to permanently delete "${propertyTitle}" from the marketplace? Active inquiries and appointments linked to this property may be impacted.`,
      confirmText: "Delete Listing",
      isDanger: true,
      action: async () => {
        setConfirmLoading(true);
        try {
          await propertyApi.delete(propertyId);
          setProperties((prev) => prev.filter((p) => (p._id || p.id) !== propertyId));
          showNotification(`Property listing "${propertyTitle}" deleted.`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error("Failed to delete property: " + err.message);
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  // --- APPOINTMENT ACTIONS ---
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentApi.updateStatus(appointmentId, newStatus);
      setAppointments((prev) =>
        prev.map((a) =>
          (a._id || a.id) === appointmentId ? { ...a, status: newStatus } : a
        )
      );
      showNotification(`Appointment status marked as "${newStatus}".`);
    } catch (err) {
      toast.error("Failed to update appointment status: " + err.message);
    }
  };

  const handleDeleteAppointmentPrompt = (appointmentId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Visit Appointment",
      message: "Are you sure you want to remove this property visit schedule record?",
      confirmText: "Delete Appointment",
      isDanger: true,
      action: async () => {
        setConfirmLoading(true);
        try {
          await appointmentApi.delete(appointmentId);
          setAppointments((prev) => prev.filter((a) => (a._id || a.id) !== appointmentId));
          showNotification("Appointment record removed.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error("Failed to delete appointment: " + err.message);
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  // --- INQUIRY ACTIONS ---
  const handleUpdateInquiryStatus = async (inquiryId, newStatus, responseText = "") => {
    try {
      await inquiryApi.updateStatus(inquiryId, newStatus, responseText);
      setInquiries((prev) =>
        prev.map((i) =>
          (i._id || i.id) === inquiryId
            ? { ...i, status: newStatus, ...(responseText ? { response: responseText } : {}) }
            : i
        )
      );
      if (selectedInquiry && (selectedInquiry._id || selectedInquiry.id) === inquiryId) {
        setSelectedInquiry((prev) => ({
          ...prev,
          status: newStatus,
          ...(responseText ? { response: responseText } : {}),
        }));
      }
      showNotification(`Inquiry status updated to "${newStatus}".`);
      window.dispatchEvent(new CustomEvent("homehub_inquiry_updated"));
    } catch (err) {
      toast.error("Failed to update inquiry: " + err.message);
    }
  };

  const handleDeleteInquiryPrompt = (inquiryId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Visitor Inquiry",
      message: "Are you sure you want to delete this buyer inquiry lead?",
      confirmText: "Delete Inquiry",
      isDanger: true,
      action: async () => {
        setConfirmLoading(true);
        try {
          await inquiryApi.delete(inquiryId);
          setInquiries((prev) => prev.filter((i) => (i._id || i.id) !== inquiryId));
          showNotification("Inquiry deleted successfully.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error("Failed to delete inquiry: " + err.message);
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  // --- VISITOR LOG ACTIONS ---
  const handleClearVisitorLogsPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Purge All Visitor Logs",
      message: `Are you sure you want to permanently clear all ${visitorLogs.length} visitor traffic and impression logs from MongoDB Atlas? This will reset all historical traffic counters.`,
      confirmText: "Clear All Logs",
      isDanger: true,
      action: async () => {
        setConfirmLoading(true);
        try {
          await visitorApi.clearLogs();
          setVisitorLogs([]);
          setVisitorStats({ totalViews: 0, loggedInCount: 0, guestCount: 0, uniqueIps: 0 });
          showNotification("Visitor traffic logs cleared successfully.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error("Failed to clear visitor logs: " + err.message);
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  // Header metadata based on activeView
  const viewMeta = useMemo(() => {
    switch (activeView) {
      case "users":
        return {
          title: "User Directory & Role Permissions",
          breadcrumbs: [
            { label: "Administration", path: "/admin/dashboard" },
            { label: "Management" },
            { label: "Users" },
          ],
        };
      case "properties":
        return {
          title: "Marketplace Properties Inventory",
          breadcrumbs: [
            { label: "Administration", path: "/admin/dashboard" },
            { label: "Management" },
            { label: "Properties" },
          ],
        };
      case "appointments":
        return {
          title: "Scheduled Property Visits",
          breadcrumbs: [
            { label: "Administration", path: "/admin/dashboard" },
            { label: "Operations" },
            { label: "Appointments" },
          ],
        };
      case "inquiries":
        return {
          title: "Client Inquiries & Requirement Leads",
          breadcrumbs: [
            { label: "Administration", path: "/admin/dashboard" },
            { label: "Operations" },
            { label: "Inquiries" },
          ],
        };
      case "analytics":
        return {
          title: "Visitor Traffic & Impression Analytics",
          breadcrumbs: [
            { label: "Administration", path: "/admin/dashboard" },
            { label: "Insights" },
            { label: "Visitor Analytics" },
          ],
        };
      case "settings":
        return {
          title: "System Administration & Settings",
          breadcrumbs: [
            { label: "Administration", path: "/admin/dashboard" },
            { label: "System" },
            { label: "Settings" },
          ],
        };
      case "dashboard":
      default:
        return {
          title: "Executive Overview Dashboard",
          breadcrumbs: [
            { label: "Administration" },
            { label: "Dashboard" },
          ],
        };
    }
  }, [activeView]);

  return (
    <AdminLayout
      title={viewMeta.title}
      breadcrumbs={viewMeta.breadcrumbs}
      counts={{
        users: users.length,
        properties: properties.length,
        appointments: appointments.length,
        inquiries: inquiries.length,
        offers: offers.length,
        visitors: visitorLogs.length,
      }}
      loading={loading}
      onRefresh={loadAllAdminData}
    >
      {/* Toast Notification Alert Banner */}
      {actionSuccess && (
        <div className="p-3.5 bg-[#F0F6F3] border border-[#C3DCD0] text-[#193027] rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#315C4B] shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess("")}
            className="text-slate-500 hover:text-slate-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* View Switching */}
      {activeView === "dashboard" && (
        <AdminOverview
          users={users}
          properties={properties}
          appointments={appointments}
          inquiries={inquiries}
          visitorStats={visitorStats}
          loading={loading}
          error={error}
          onOpenUserModal={handleOpenUserModal}
          onOpenPropertyModal={handleOpenPropertyModal}
          onSelectInquiry={(inq) => setSelectedInquiry(inq)}
        />
      )}

      {activeView === "users" && (
        <AdminUsers
          users={users}
          onOpenUserModal={handleOpenUserModal}
          onChangeRole={handleChangeRole}
          onDeleteUser={handleDeleteUserPrompt}
        />
      )}

      {activeView === "properties" && (
        <AdminProperties
          properties={properties}
          onOpenPropertyModal={handleOpenPropertyModal}
          onDeleteProperty={handleDeletePropertyPrompt}
        />
      )}

      {activeView === "appointments" && (
        <AdminAppointments
          appointments={appointments}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onDeleteAppointment={handleDeleteAppointmentPrompt}
        />
      )}

      {activeView === "inquiries" && (
        <AdminInquiries
          inquiries={inquiries}
          onUpdateStatus={handleUpdateInquiryStatus}
          onSelectInquiry={(inq) => setSelectedInquiry(inq)}
          onDeleteInquiry={handleDeleteInquiryPrompt}
        />
      )}

      {activeView === "offers" && <AdminOffers />}

      {activeView === "analytics" && (
        <AdminAnalytics
          visitorStats={visitorStats}
          visitorLogs={visitorLogs}
          onClearLogs={handleClearVisitorLogsPrompt}
        />
      )}

      {activeView === "settings" && (
        <AdminSettings
          usersCount={users.length}
          propertiesCount={properties.length}
          appointmentsCount={appointments.length}
          inquiriesCount={inquiries.length}
          visitorLogsCount={visitorLogs.length}
          loading={loading}
          onRefreshData={loadAllAdminData}
          onClearLogs={handleClearVisitorLogsPrompt}
        />
      )}

      {/* --- MODALS --- */}
      <AdminUserModal
        isOpen={userModalOpen}
        user={editingUser}
        defaultRole={defaultUserRole}
        loading={submittingUser}
        onSave={handleSaveUser}
        onClose={() => setUserModalOpen(false)}
      />

      <AdminPropertyModal
        isOpen={propertyModalOpen}
        property={editingProperty}
        defaultPurpose={defaultPropertyPurpose}
        loading={submittingProperty}
        onSave={handleSaveProperty}
        onClose={() => setPropertyModalOpen(false)}
      />

      <AdminInquiryModal
        isOpen={Boolean(selectedInquiry)}
        inquiry={selectedInquiry}
        onStatusChange={handleUpdateInquiryStatus}
        onClose={() => setSelectedInquiry(null)}
      />

      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        isDanger={confirmDialog.isDanger}
        loading={confirmLoading}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </AdminLayout>
  );
}
