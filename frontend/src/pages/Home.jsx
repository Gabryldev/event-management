import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (q = "") => {
    setLoading(true);

    try {
      const res = await api.get("/events", {
        params: {
          search: q,
          upcoming: "true",
        },
      });

      console.log("Events API Response:", res.data);

      setEvents(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Fetch events error:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchEvents(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(search);
  };

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-4 py-20">

          <p className="eyebrow text-amber mb-4">
            The modern way to experience events
          </p>

          <h1 className="font-display text-5xl md:text-6xl font-semibold max-w-3xl leading-tight">
            Moments worth
            <span className="block text-amber">
              showing up for.
            </span>
          </h1>

          <p className="text-paper/70 mt-5 max-w-2xl text-lg leading-relaxed">
            Discover exceptional events, secure your place effortlessly,
            and turn ordinary days into unforgettable experiences.
            Your next great memory starts here.
          </p>

          {/* AUTH BUTTONS */}
          <div className="flex flex-wrap items-center gap-4 mt-8">

            {!user ? (
              <>
                <Link
                  to="/events"
                  className="btn-amber inline-flex items-center gap-2"
                >
                  Explore Events →
                </Link>

                <Link
                  to="/login"
                  className="btn-outline !border-paper !text-paper hover:!bg-paper hover:!text-ink"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn-outline !border-paper/30 !text-paper"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/events"
                  className="btn-amber inline-flex items-center gap-2"
                >
                  Browse Events →
                </Link>

                <Link
                  to="/my-tickets"
                  className="btn-outline !border-paper !text-paper hover:!bg-paper hover:!text-ink"
                >
                  My Tickets
                </Link>

                {(user.role === "organizer" || user.role === "admin") && (
                  <Link
                    to="/organizer/create"
                    className="btn-outline !border-paper/30 !text-paper"
                  >
                    Create Event
                  </Link>
                )}
              </>
            )}

          </div>

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="mt-10 flex gap-2 max-w-xl"
          >
            <input
              type="text"
              placeholder="Search events, venues, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-white/20 p-4 rounded-xl w-full bg-white text-black outline-none focus:ring-2 focus:ring-amber"
            />

            <button
              type="submit"
              className="btn-amber whitespace-nowrap px-6"
            >
              Search
            </button>
          </form>

        </div>
      </section>

      {/* EVENTS */}
      <section className="max-w-6xl mx-auto px-4 py-12">

        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow text-amber mb-2">
              Discover
            </p>

            <h2 className="font-display text-3xl font-semibold">
              Upcoming events
            </h2>

            <p className="text-slate-muted mt-1">
              Find your next experience and reserve your place.
            </p>
          </div>

          <Link
            to="/events"
            className="hidden sm:block text-sm font-medium hover:text-amber transition"
          >
            View all events →
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <p className="text-slate-muted">
              Loading events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-xl mb-1">
              No events found
            </p>

            <p className="text-slate-muted">
              Check back soon, or try a different search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <EventCard
                key={ev._id}
                event={ev}
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
};

export default Home;