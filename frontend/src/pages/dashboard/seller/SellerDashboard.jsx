import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, PlusCircle, MessageSquare, TrendingUp, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import DashboardCard from "../../../components/dashboard/DashboardCard";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myProperties, fetchMyProperties, deleteProperty, inquiries } = useProperty();
  const { toast, confirm } = useToast();

  useEffect(() => {
    fetchMyProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: "Delete Property Listing",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete Listing",
      cancelText: "Cancel",
      isDanger: true,
    });
    if (!confirmed) return;

    try {
      await deleteProperty(id);
      toast.success(`Property "${title}" deleted successfully.`);
    } catch (err) {
      toast.error("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-navy-900 text-white rounded-3xl p-8 border border-navy-800 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Seller & Developer Console
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-white">Hello, {user?.name || "Seller"} 👋</h1>
          <p className="text-ivory-300 text-sm">
            Manage your verified property listings and buyer inquiry pipeline.
          </p>
        </div>
        <Link
          to="/seller/add-property"
          className="mt-4 md:mt-0 bg-forest-700 hover:bg-forest-800 text-white font-bold px-6 py-3 rounded-xl shadow-subtle transition-all flex items-center space-x-2 text-sm shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Properties"
          value={myProperties.length}
          change="Live Synced"
          icon={Building2}
          color="forest"
        />
        <DashboardCard
          title="Active Listings"
          value={myProperties.length}
          change="Published live"
          icon={CheckCircle2}
          color="gold"
        />
        <DashboardCard
          title="Total Inquiries"
          value={inquiries.length}
          change="Received from buyers"
          icon={MessageSquare}
          color="forest"
        />
        <DashboardCard
          title="Inquiry Views"
          value="1,420"
          change="+18% this week"
          icon={TrendingUp}
          color="gold"
        />
      </div>

      {/* Listed Properties Table with Real CRUD Actions */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-ivory-200 pb-4">
          <h3 className="font-heading font-extrabold text-lg text-navy-900">Your Listed Properties</h3>
          <Link to="/seller/add-property" className="text-xs font-bold text-forest-700 hover:underline flex items-center space-x-1">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </Link>
        </div>

        {myProperties.length === 0 ? (
          <div className="text-center py-8 text-sm text-navy-500 font-semibold">
            No properties found. Click "Add New Property" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-100 text-navy-700 font-bold uppercase text-[11px] tracking-wider border-b border-ivory-200">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Property</th>
                  <th className="p-3.5">Type & Purpose</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 font-semibold text-navy-800">
                {myProperties.map((prop) => {
                  const propId = prop._id || prop.id;
                  return (
                    <tr key={propId} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-navy-900">{prop.title}</td>
                      <td className="p-3.5">
                        <span className="capitalize">{prop.type || prop.propertyType} ({prop.purpose})</span>
                      </td>
                      <td className="p-3.5 font-extrabold text-forest-700">{prop.formattedPrice}</td>
                      <td className="p-3.5 text-navy-600">{prop.location}</td>
                      <td className="p-3.5">
                        <span className="px-3 py-1 bg-forest-50 text-forest-700 border border-forest-100 rounded-full text-xs font-extrabold">
                          {prop.status || "Active"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/seller/edit-property/${propId}`)}
                            className="p-2 bg-ivory-200 hover:bg-ivory-300 text-navy-900 rounded-lg text-xs font-bold flex items-center space-x-1"
                            title="Edit Property"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(propId, prop.title)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center space-x-1"
                            title="Delete Property"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
