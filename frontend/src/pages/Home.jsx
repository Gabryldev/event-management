import { useEffect, useState } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
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
    <div>
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <p className="eyebrow text-amber mb-3">Now booking</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold max-w-2xl leading-tight">
            Find your next event. Skip the line at the door.
          </h1>
          <p className="text-paper/70 mt-3 max-w-xl">
            Browse approved events, reserve your seat, and get a QR ticket delivered straight to your inbox.
          </p>
          <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-md">
           <input
  type="text"
  placeholder="Search events..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="border border-gray-400 p-3 rounded w-full bg-white text-black"
/>
            <button className="btn-amber whitespace-nowrap">Search</button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
  {loading ? (
    <p className="text-slate-muted">Loading events...</p>
  ) : events?.length === 0 ? (
    <div className="text-center py-16">
      <p className="font-display text-xl mb-1">No events found</p>
      <p className="text-slate-muted">
        Check back soon, or try a different search.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((ev) => (
        <EventCard key={ev._id} event={ev} />
      ))}
    </div>
  )}
</section>
    </div>
  );
};

export default Home;
