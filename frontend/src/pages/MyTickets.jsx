import { useEffect, useState } from 'react';
import api from '../api/axios';

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const statusColors = {
  booked: 'bg-amber/20 text-amber-dark',
  checked_in: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/mine').then((res) => setTickets(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">My Tickets</h1>

      {loading ? (
        <p className="text-slate-muted">Loading...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-xl mb-1">No tickets yet</p>
          <p className="text-slate-muted">Browse events and grab your first ticket.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t._id} className="ticket-stub">
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${statusColors[t.status]}`}>{t.status.replace('_', ' ')}</span>
                </div>
                <h2 className="font-display text-lg font-semibold mb-1">{t.event?.title}</h2>
                <p className="text-sm text-slate-muted">{t.event?.venue}</p>
                <p className="text-sm text-slate-muted">{t.event?.startDate && formatDate(t.event.startDate)}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  {t.seatLabel && (
                    <span>
                      Seat: <span className="font-mono">{t.seatLabel}</span>
                    </span>
                  )}
                  {t.quantity > 1 && <span>Qty: {t.quantity}</span>}
                  <span className="font-mono">${t.pricePaid.toFixed(2)}</span>
                </div>
              </div>
              <div className="stub-notch left" />
              <div className="stub-divider" />
              <div className="stub-notch right" />
              <div className="p-5 flex flex-col items-center justify-center w-40">
                {t.qrCode && <img src={t.qrCode} alt="QR" className="w-28 h-28" />}
                <p className="font-mono text-[9px] text-slate-muted mt-2 text-center break-all">{t.ticketCode}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
