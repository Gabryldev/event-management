import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import api from "../api/axios";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition">
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
     <h2 className="text-xl lg:text-2xl font-bold mt-2 truncate">
  {value}
</h2>
    </div>

    <div className={`text-4xl ${color}`}>{icon}</div>
  </div>
);

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reasonDrafts, setReasonDrafts] = useState({});
  const [processing, setProcessing] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const [pendingRes, statsRes] = await Promise.all([
        api.get("/events/admin/pending"),
        api.get("/analytics/admin"),
      ]);

      setPending(pendingRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReview = async (id, decision) => {
    try {
      setProcessing(id);

      await api.put(`/events/admin/${id}/review`, {
        decision,
        reason:
          decision === "rejected"
            ? reasonDrafts[id] || ""
            : undefined,
      });

      toast.success(
        `Event ${decision === "approved" ? "approved" : "rejected"
        } successfully`
      );

      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  const filteredPending = pending.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">

          <StatCard
            icon={<FaUsers />}
            label="Users"
            value={stats.totalUsers}
            color="text-blue-600"
          />

          <StatCard
            icon={<FaUsers />}
            label="Organizers"
            value={stats.totalOrganizers}
            color="text-green-600"
          />

          <StatCard
            icon={<FaCalendarAlt />}
            label="Events"
            value={stats.totalEvents}
            color="text-purple-600"
          />

          <StatCard
            icon={<FaClock />}
            label="Pending"
            value={stats.pendingEvents}
            color="text-yellow-500"
          />

          <StatCard
            icon={<FaEye />}
            label="Tickets"
            value={stats.totalTickets}
            color="text-red-500"
          />

          <StatCard
            icon={<FaMoneyBillWave />}
            label="Revenue"
            value={`₦${Number(stats.totalRevenue).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            color="text-emerald-600"
          />

        </div>
      )}

      {/* Search */}

      <div className="mb-8 relative">
        <FaSearch className="absolute left-4 top-4 text-gray-400" />

        <input
          type="text"
          placeholder="Search pending events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <h2 className="text-2xl font-bold mb-6">
        Pending Events
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : filteredPending.length === 0 ? (
        <p className="text-gray-500">
          No pending events.
        </p>
      ) : (
        <div className="space-y-6">

          {filteredPending.map((ev) => (
            <div
              key={ev._id}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">

                {ev.flyer?.url && (
                  <img
                    src={ev.flyer.url}
                    alt={ev.title}
                    className="w-full md:w-56 h-40 object-cover rounded-xl"
                  />
                )}

                <div className="flex-1">

                  <h3 className="text-2xl font-bold">
                    {ev.title}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {ev.organizer?.name} ({ev.organizer?.email})
                  </p>

                  <p className="mt-2">
                    📍 {ev.venue}
                  </p>

                  <p>
                    📅 {new Date(ev.startDate).toLocaleDateString()}
                  </p>

                  <p>
                    👥 Capacity: {ev.capacity}
                  </p>

                  <p className="mt-3 text-gray-600">
                    {ev.description}
                  </p>

                  <input
                    type="text"
                    placeholder="Reason (optional)"
                    value={reasonDrafts[ev._id] || ""}
                    onChange={(e) =>
                      setReasonDrafts({
                        ...reasonDrafts,
                        [ev._id]: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-3 mt-5"
                  />

                  <div className="flex gap-3 mt-5">

                    <button
                      disabled={processing === ev._id}
                      onClick={() =>
                        handleReview(ev._id, "approved")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                    >
                      {processing === ev._id
                        ? "Approving..."
                        : "Approve"}
                    </button>

                    <button
                      disabled={processing === ev._id}
                      onClick={() =>
                        handleReview(ev._id, "rejected")
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                    >
                      {processing === ev._id
                        ? "Rejecting..."
                        : "Reject"}
                    </button>

                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;