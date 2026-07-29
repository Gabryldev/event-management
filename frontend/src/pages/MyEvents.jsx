import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusColors = {
  pending: 'bg-amber/20 text-amber-dark',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-danger/15 text-danger',
};

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/mine').then((res) => setEvents(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold">My Events</h1>
        <Link to="/organizer/create" className="btn-amber">
          + New event
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-muted">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-slate-muted">You haven't created any events yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev._id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${statusColors[ev.status]}`}>{ev.status}</span>
                  {ev.isCancelled && <span className="badge bg-ink/10 text-ink/60">cancelled</span>}
                </div>
                <h2 className="font-display text-lg font-semibold">{ev.title}</h2>
                <p className="text-sm text-slate-muted">
                  {new Date(ev.startDate).toLocaleDateString()} · {ev.venue} · {ev.seatsAvailable}/{ev.capacity} seats left
                </p>
                {ev.status === 'rejected' && ev.rejectionReason && (
                  <p className="text-sm text-danger mt-1">Reason: {ev.rejectionReason}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link to={`/events/${ev._id}`} className="btn-outline text-sm">
                  View
                </Link>
                <Link to={`/organizer/analytics/${ev._id}`} className="btn-outline text-sm">
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
