import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [purchasedTicket, setPurchasedTicket] = useState(null);

  const loadEvent = async () => {
    const res = await api.get(`/events/${id}`);
    setEvent(res.data.data);
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setPurchasing(true);
    try {
      const payload = { eventId: id };
      if (event.seatingType === 'assigned') {
        if (!selectedSeat) {
          setError('Please select a seat first');
          setPurchasing(false);
          return;
        }
        payload.seatLabel = selectedSeat;
      } else {
        payload.quantity = quantity;
      }
      const res = await api.post('/tickets/purchase', payload);
      setPurchasedTicket(res.data.data);
      await loadEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (!event) return <div className="max-w-4xl mx-auto px-4 py-16 text-slate-muted">Loading...</div>;

  if (purchasedTicket) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="font-display text-2xl font-semibold mb-6 text-center">You're all set! 🎟️</h1>
        <div className="ticket-stub">
          <div className="p-5 flex-1">
            <p className="eyebrow mb-1">{event.category}</p>
            <h2 className="font-display text-lg font-semibold mb-2">{event.title}</h2>
            <p className="text-sm text-slate-muted mb-1">{event.venue}</p>
            <p className="text-sm text-slate-muted">{formatDate(event.startDate)}</p>
            {purchasedTicket.seatLabel && (
              <p className="mt-3 text-sm">
                Seat: <span className="font-mono font-medium">{purchasedTicket.seatLabel}</span>
              </p>
            )}
          </div>
          <div className="stub-notch left" />
          <div className="stub-divider" />
          <div className="stub-notch right" />
          <div className="p-5 flex flex-col items-center justify-center w-44">
            {purchasedTicket.qrCode && <img src={purchasedTicket.qrCode} alt="QR Ticket" className="w-32 h-32" />}
            <p className="font-mono text-[10px] text-slate-muted mt-2 text-center break-all">
              {purchasedTicket.ticketCode}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-muted text-center mt-6">
          A confirmation email with this QR code has been sent to your inbox.
        </p>
        <button onClick={() => navigate('/my-tickets')} className="btn-primary w-full mt-6">
          View my tickets
        </button>
      </div>
    );
  }

 return (
  <>
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline font-medium"
      >
        ← Back
      </button>
    </div>

    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="h-64 bg-ink/5 rounded-xl overflow-hidden mb-6">
          {event.flyer?.url ? (
            <img
              src={event.flyer.url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/20 font-display text-5xl">
              {event.title?.[0]}
            </div>
          )}
        </div>
        <p className="eyebrow mb-2">{event.category}</p>
        <h1 className="font-display text-3xl font-semibold mb-3">{event.title}</h1>
        <p className="text-slate-muted mb-1">{formatDate(event.startDate)}</p>
        <p className="text-slate-muted mb-6">
          {event.venue}
          {event.address ? `, ${event.address}` : ''}
        </p>
        <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
      </div>

      <div>
        <div className="card p-5 sticky top-20">
          <p className="font-mono text-2xl mb-1">{event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}</p>
          <p className="text-sm text-slate-muted mb-4">
            {event.seatsAvailable > 0 ? `${event.seatsAvailable} of ${event.capacity} seats left` : 'Sold out'}
          </p>

          {error && <p className="text-danger text-sm bg-danger/10 rounded-lg px-3 py-2 mb-4">{error}</p>}

          {event.seatingType === 'assigned' ? (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Choose a seat</p>
              <div className="grid grid-cols-8 gap-1 max-h-56 overflow-y-auto pr-1">
                {event.seatMap.map((seat) => (
                  <button
                    key={seat.label}
                    disabled={seat.status !== 'available'}
                    onClick={() => setSelectedSeat(seat.label)}
                    title={seat.label}
                    className={`text-[10px] font-mono rounded py-1 border transition-colors ${
                      seat.status !== 'available'
                        ? 'bg-ink/10 text-ink/30 border-transparent cursor-not-allowed'
                        : selectedSeat === seat.label
                        ? 'bg-amber border-amber text-ink font-semibold'
                        : 'border-ink/15 hover:border-ink/40'
                    }`}
                  >
                    {seat.label}
                  </button>
                ))}
              </div>
              {selectedSeat && <p className="text-sm mt-2">Selected: <span className="font-mono">{selectedSeat}</span></p>}
            </div>
          ) : (
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <input
                type="number"
                min={1}
                max={event.seatsAvailable}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input-field"
              />
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={purchasing || event.seatsAvailable <= 0}
            className="btn-amber w-full"
          >
            {purchasing ? 'Processing...' : event.seatsAvailable <= 0 ? 'Sold out' : 'Get ticket'}
          </button>
        </div>
      </div>
       </div>
  </>
);
};

export default EventDetails;
