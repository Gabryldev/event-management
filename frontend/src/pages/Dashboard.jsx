import { useEffect, useState } from "react";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import api from "../api/axios";
import EventCard from "../components/EventCard";

const Dashboard = () => {
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

      setEvents(
        Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
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
    <div className="min-h-screen bg-paper">

      {/* ==============================
          BROWSE EVENTS HEADER
      =============================== */}
      <section className="bg-white border-b border-ink/10">

        <div className="max-w-7xl mx-auto px-6 py-12">

          <div className="max-w-3xl">

            <p className="eyebrow text-amber mb-3">
              Explore
            </p>

            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              Browse Events
            </h1>

            <p className="text-slate-muted mt-3 text-lg">
              Find something worth showing up for.
              Explore upcoming experiences and secure your place.
            </p>

          </div>


          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-3xl"
          >

            <div className="relative">

              <FaSearch
                className="
                  absolute
                  left-5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                placeholder="Search events, venues, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  h-14
                  pl-12
                  pr-28
                  rounded-xl
                  bg-slate-50
                  border
                  border-ink/10
                  text-ink
                  outline-none
                  focus:border-amber
                  transition
                "
              />

              <button
                type="submit"
                className="
                  absolute
                  right-2
                  top-2
                  bottom-2
                  px-5
                  rounded-lg
                  bg-amber
                  text-ink
                  font-semibold
                  hover:opacity-90
                  transition
                "
              >
                Search
              </button>

            </div>

          </form>

        </div>

      </section>


      {/* ==============================
          EVENTS AREA
      =============================== */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* TOP ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>

            <h2 className="font-display text-2xl md:text-3xl font-semibold">
              Upcoming events
            </h2>

            <p className="text-sm text-slate-muted mt-1">
              {events.length}{" "}
              {events.length === 1 ? "event" : "events"} available
            </p>

          </div>


          <button
            type="button"
            className="
              flex
              items-center
              justify-center
              gap-2
              border
              border-ink/10
              rounded-lg
              px-4
              py-2.5
              text-sm
              hover:border-amber
              transition
            "
          >
            <FaSlidersH />
            Filters
          </button>

        </div>


        {/* LOADING */}
        {loading && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="
                  rounded-2xl
                  overflow-hidden
                  bg-white
                  border
                  border-ink/10
                  animate-pulse
                "
              >

                <div className="h-56 bg-ink/10" />

                <div className="p-5 space-y-3">

                  <div className="h-3 bg-ink/10 rounded w-24" />

                  <div className="h-5 bg-ink/10 rounded w-3/4" />

                  <div className="h-3 bg-ink/10 rounded w-1/2" />

                </div>

              </div>

            ))}

          </div>

        )}


        {/* NO EVENTS */}
        {!loading && events.length === 0 && (

          <div className="py-24 text-center">

            <h3 className="font-display text-2xl font-semibold">
              No events found
            </h3>

            <p className="text-slate-muted mt-2">
              Try another search or check back later.
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-5 text-amber font-medium hover:underline"
              >
                Clear search
              </button>
            )}

          </div>

        )}


        {/* EVENT CARDS */}
        {!loading && events.length > 0 && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
              />
            ))}

          </div>

        )}

      </main>

    </div>
  );
};

export default Dashboard;