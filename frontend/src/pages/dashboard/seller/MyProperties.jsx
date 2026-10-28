import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, PlusCircle, Edit, Trash2, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import { useToast } from "../../../context/ToastContext";

const MyProperties = () => {
  const navigate = useNavigate();
  const { myProperties, fetchMyProperties, deleteProperty, loading } = useProperty();
  const { toast, confirm } = useToast();
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchMyProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: "Delete Property Listing",
      message: `Are you sure you want to permanently delete property listing "${title}"? This action cannot be undone.`,
      confirmText: "Delete Listing",
      cancelText: "Cancel",
      isDanger: true,
    });
    if (!confirmed) return;

    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteProperty(id);
      toast.success(`Property listing "${title}" deleted successfully.`);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to delete property";
      setDeleteError(errMsg);
      toast.error(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900 tracking-tight">
            Managed Property Listings
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Manage your active portfolio residences, edit pricing, or publish new listings.
          </p>
        </div>
        <Link
          to="/seller/add-property"
          className="bg-forest-700 hover:bg-forest-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center space-x-2 text-xs shadow-subtle border border-forest-800 transition-all shrink-0 active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {deleteError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Grid of User Properties */}
      {loading && myProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white rounded-3xl border border-ivory-300">
          <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
          <p className="text-xs font-semibold text-navy-600">Retrieving portfolio listings...</p>
        </div>
      ) : myProperties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 space-y-4">
          <div className="w-14 h-14 bg-ivory-100 text-navy-800 border border-ivory-300 rounded-2xl flex items-center justify-center mx-auto shadow-subtle">
            <Building2 className="w-7 h-7 text-forest-700" />
          </div>
          <h3 className="text-lg font-heading font-bold text-navy-900">No properties published yet</h3>
          <p className="text-navy-500 text-xs max-w-md mx-auto font-sans">
            You currently have no active listings. Publish your first property listing to make it visible to verified buyers and investors.
          </p>
          <Link
            to="/seller/add-property"
            className="inline-flex items-center space-x-2 bg-forest-700 hover:bg-forest-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-subtle border border-forest-800"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish First Residence</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map((prop) => {
            const propId = prop._id || prop.id;
            return (
              <div
                key={propId}
                className="bg-white rounded-2xl border border-ivory-300 shadow-subtle overflow-hidden flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-ivory-200 overflow-hidden">
                    <img
                      src={prop.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-forest-700 text-white font-bold text-[10px] rounded-lg shadow-subtle">
                      {prop.status || "Active"}
                    </div>
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-navy-900/90 backdrop-blur-md text-white font-bold text-[10px] rounded-lg border border-navy-800">
                      {prop.type || "Apartment"} ({prop.purpose === "rent" ? "Rent" : "Sale"})
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-heading font-bold text-base text-navy-900 line-clamp-1">{prop.title}</h3>
                    <p className="text-xl font-heading font-extrabold text-forest-700">{prop.formattedPrice}</p>
                    <p className="text-xs text-navy-500 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </p>
                    <div className="flex items-center space-x-4 text-xs font-medium text-navy-600 pt-2 border-t border-ivory-200">
                      <span>{prop.bedrooms || 3} Beds</span>
                      <span>•</span>
                      <span>{prop.bathrooms || 2} Baths</span>
                      <span>•</span>
                      <span>{prop.area || prop.areaSqFt || 1800} sq.ft</span>
                    </div>
                  </div>
                </div>

                {/* Edit and Delete Actions */}
                <div className="p-5 pt-0 border-t border-ivory-200 mt-2 flex items-center justify-between gap-3 pt-3">
                  <button
                    onClick={() => navigate(`/seller/edit-property/${propId}`)}
                    className="flex-1 bg-ivory-100 hover:bg-ivory-200 text-navy-900 font-semibold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-ivory-300"
                  >
                    <Edit className="w-3.5 h-3.5 text-navy-700" />
                    <span>Edit Listing</span>
                  </button>

                  <button
                    onClick={() => handleDelete(propId, prop.title)}
                    disabled={deletingId === propId}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-rose-200 disabled:opacity-60"
                  >
                    {deletingId === propId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
