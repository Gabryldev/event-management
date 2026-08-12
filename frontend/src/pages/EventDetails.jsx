import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const API_ORIGIN = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "");

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [purchasedTicket, setPurchasedTicket] = useState(null);

  const loadEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.data);
    } catch (err) {
      console.error("Failed to load event:", err);
      setError("Unable to load this event.");
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setError("");
    setPurchasing(true);

    try {
      const payload = { eventId: id };

      if (event.seatingType === "assigned") {
        if (!selectedSeat) {
          setError("Please select a seat first.");
          setPurchasing(false);
          return;
        }

        payload.seatLabel = selectedSeat;
      } else {
        payload.quantity = quantity;
      }

      const res = await api.post("/tickets/purchase", payload);

      setPurchasedTicket(res.data.data);
      await loadEvent();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to complete your purchase."
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <p className="text-slate-muted">Loading event...</p>
      </div>
    );
  }

  /* =========================
     PURCHASE SUCCESS
  ========================= */

  if (purchasedTicket) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl">
              ✓
            </div>

            <h1 className="font-display text-3xl font-bold text-ink mt-5">
              You're all set!
            </h1>

            <p className="text-slate-muted mt-2">
              Your ticket has been successfully reserved.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">

            <div className="bg-ink text-white p-6">
              <p className="text-amber uppercase tracking-widest text-xs font-semibold">
                Event Ticket
              </p>

              <h2 className="font-display text-2xl font-bold mt-2">
                {event.title}
              </h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-muted">
                  Venue
                </p>

                <p className="font-medium mt-1">
                  {event.venue}
                </p>

                <p className="text-sm text-slate-muted mt-4">
                  {formatDate(event.startDate)}
                </p>

                {purchasedTicket.seatLabel && (
                  <p className="mt-4">
                    Seat:{" "}
                    <span className="font-mono font-semibold">
                      {purchasedTicket.seatLabel}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                {purchasedTicket.qrCode && (
                  <img
                    src={purchasedTicket.qrCode}
                    alt="QR Ticket"
                    className="w-36 h-36"
                  />
                )}

                <p className="font-mono text-xs text-slate-muted mt-3 text-center break-all">
                  {purchasedTicket.ticketCode}
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={() => navigate("/my-tickets")}
            className="
              w-full
              mt-6
              py-3.5
              rounded-xl
              bg-ink
              text-white
              font-semibold
              hover:bg-black
              transition
            "
          >
            View My Tickets
          </button>

        </div>
      </div>
    );
  }

  /* =========================
     EVENT DETAILS
  ========================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Back navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-6">

        <button
          onClick={() => navigate("/events")}
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-600
            hover:text-ink
            transition
          "
        >
          ← Back to Events
        </button>

      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">

        <div className="grid lg:grid-cols-3 gap-7">

          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="lg:col-span-2">

            {/* EVENT IMAGE */}

            <div
              className="
                relative
                h-[250px]
                md:h-[300px]
                rounded-3xl
                overflow-hidden
                bg-ink
                shadow-xl
              "
            >

              {event.flyer?.url ? (
                <img
                  src={`${API_ORIGIN}${event.flyer.url}`}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="
                  w-full
                  h-full
                  flex
                  items-center
                  justify-center
                  text-white/30
                  font-display
                  text-7xl
                ">
                  {event.title?.[0] || "E"}
                </div>
              )}

              {/* Image overlay */}

              <div className="
                absolute
                inset-x-0
                bottom-0
                p-5
                bg-gradient-to-t
                from-black/80
                to-transparent
              ">

                <span className="
                  inline-flex
                  px-3
                  py-1
                  rounded-full
                  bg-amber
                  text-ink
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                ">
                  {event.category || "Event"}
                </span>

              </div>

            </div>

            {/* EVENT CONTENT */}

            <div className="mt-5">

              {/* Category + premium */}

              <div className="flex items-center gap-3 mb-2">

                <span className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                  text-amber-600
                ">
                  {event.category || "Event"}
                </span>

                <span className="text-xs text-slate-400">
                  •
                </span>

                <span className="text-xs text-slate-muted">
                  Premium Experience
                </span>

              </div>

              {/* Title */}

              <h1 className="
                font-display
                text-4xl
                md:text-5xl
                font-bold
                text-ink
                leading-tight
              ">
                {event.title}
              </h1>

              {/* Date + Location */}

              <div className="grid md:grid-cols-2 gap-4 mt-5">

                {/* DATE */}

                <div className="
                  bg-white
                  rounded-2xl
                  p-4
                  border
                  border-slate-200
                  shadow-sm
                ">

                  <div className="flex items-center gap-3">

                    <div className="
                      w-10
                      h-10
                      rounded-xl
                      bg-amber/15
                      flex
                      items-center
                      justify-center
                      text-lg
                    ">
                      📅
                    </div>

                    <div>

                      <p className="
                        text-[10px]
                        uppercase
                        tracking-widest
                        text-slate-muted
                        font-bold
                      ">
                        Date & Time
                      </p>

                      <p className="
                        text-sm
                        font-semibold
                        text-ink
                        mt-1
                      ">
                        {formatDate(event.startDate)}
                      </p>

                    </div>

                  </div>

                </div>

                {/* LOCATION */}

                <div className="
                  bg-white
                  rounded-2xl
                  p-4
                  border
                  border-slate-200
                  shadow-sm
                ">

                  <div className="flex items-center gap-3">

                    <div className="
                      w-10
                      h-10
                      rounded-xl
                      bg-amber/15
                      flex
                      items-center
                      justify-center
                      text-lg
                    ">
                      📍
                    </div>

                    <div>

                      <p className="
                        text-[10px]
                        uppercase
                        tracking-widest
                        text-slate-muted
                        font-bold
                      ">
                        Location
                      </p>

                      <p className="
                        text-sm
                        font-semibold
                        text-ink
                        mt-1
                      ">
                        {event.venue}
                      </p>

                      {event.address && (
                        <p className="text-xs text-slate-muted mt-1">
                          {event.address}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* ABOUT EVENT */}

              <div className="
                bg-white
                rounded-2xl
                p-5
                mt-4
                border
                border-slate-200
                shadow-sm
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                  mb-2
                ">

                  <h2 className="
                    font-display
                    text-xl
                    font-bold
                    text-ink
                  ">
                    About This Event
                  </h2>

                  <span className="
                    hidden
                    sm:block
                    text-[10px]
                    uppercase
                    tracking-widest
                    text-slate-muted
                  ">
                    Event Information
                  </span>

                </div>

                <p className="
                  text-sm
                  md:text-base
                  leading-7
                  text-slate-600
                ">
                  {event.description || "No description available."}
                </p>

              </div>

            </div>

          </div>

          {/* =========================
              RIGHT PURCHASE CARD
          ========================= */}

          <div>

            <div className="
              bg-white
              rounded-3xl
              border
              border-slate-200
              shadow-xl
              p-6
              lg:sticky
              lg:top-24
            ">

              {/* Price */}

              <div className="
                flex
                items-end
                justify-between
              ">

                <div>

                  <p className="
                    text-[10px]
                    uppercase
                    tracking-widest
                    font-bold
                    text-slate-muted
                  ">
                    Ticket Price
                  </p>

                  <p className="
                    text-3xl
                    font-bold
                    text-ink
                    mt-1
                  ">
                    {event.price > 0
                      ? `$${Number(event.price).toFixed(2)}`
                      : "Free"}
                  </p>

                </div>

                <span className="
                  text-xs
                  text-slate-muted
                ">
                  {event.seatsAvailable > 0
                    ? `${event.seatsAvailable} left`
                    : "Sold out"}
                </span>

              </div>

              <div className="h-px bg-slate-200 my-5" />

              {/* ASSIGNED SEATING */}

              {event.seatingType === "assigned" ? (

                <div>

                  <div className="
                    flex
                    justify-between
                    items-center
                    mb-3
                  ">

                    <p className="text-sm font-bold">
                      Choose Your Seat
                    </p>

                    {selectedSeat && (
                      <span className="
                        text-xs
                        bg-amber/15
                        text-ink
                        px-2
                        py-1
                        rounded-lg
                        font-semibold
                      ">
                        {selectedSeat}
                      </span>
                    )}

                  </div>

                  <div className="
                    grid
                    grid-cols-6
                    gap-1.5
                    max-h-52
                    overflow-y-auto
                    pr-1
                  ">

                    {event.seatMap?.map((seat) => (

                      <button
                        key={seat.label}
                        disabled={seat.status !== "available"}
                        onClick={() => setSelectedSeat(seat.label)}
                        title={seat.label}
                        className={`
                          py-2
                          rounded-lg
                          text-[10px]
                          font-mono
                          border
                          transition
                          ${
                            seat.status !== "available"
                              ? "bg-slate-100 text-slate-300 border-transparent cursor-not-allowed"
                              : selectedSeat === seat.label
                              ? "bg-amber border-amber text-ink font-bold"
                              : "border-slate-200 hover:border-amber hover:bg-amber/10"
                          }
                        `}
                      >
                        {seat.label}
                      </button>

                    ))}

                  </div>

                </div>

              ) : (

                <div>

                  <label className="
                    text-sm
                    font-semibold
                  ">
                    Number of Tickets
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={event.seatsAvailable}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number(e.target.value))
                    }
                    className="
                      w-full
                      mt-2
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-300
                      outline-none
                      focus:ring-2
                      focus:ring-amber
                    "
                  />

                </div>

              )}

              {/* ERROR */}

              {error && (
                <div className="
                  mt-4
                  bg-red-50
                  border
                  border-red-200
                  text-red-600
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                ">
                  {error}
                </div>
              )}

              {/* GET TICKET */}

              <div className="flex justify-end mt-5">

                <button
                  onClick={handlePurchase}
                  disabled={
                    purchasing ||
                    event.seatsAvailable <= 0
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    px-7
                    py-3
                    rounded-xl
                    bg-amber
                    text-ink
                    font-bold
                    text-sm
                    shadow-md
                    hover:shadow-lg
                    hover:-translate-y-0.5
                    transition-all
                    duration-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    disabled:hover:translate-y-0
                  "
                >
                  {purchasing
                    ? "Processing..."
                    : event.seatsAvailable <= 0
                    ? "Sold Out"
                    : "Get Ticket"}
                </button>

              </div>

              <div className="
                flex
                items-center
                justify-center
                gap-2
                mt-5
                text-xs
                text-slate-muted
              ">
                <span>🔒</span>
                <span>Secure booking</span>
                <span>•</span>
                <span>Instant confirmation</span>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default EventDetails;                                                