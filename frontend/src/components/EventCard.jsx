import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

const formatDate = (d) => {
  if (!d) return "Date not available";

  return new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventCard = ({ event }) => {
  if (!event) return null;

  const API_BASE =
    "https://event-management-14xr.onrender.com";

  const flyerUrl = event.flyer?.url
    ? `${API_BASE}${event.flyer.url}`
    : null;

  return (
    <Link
      to={`/events/${event._id}`}
      className="
        group
        block
        bg-white
        rounded-2xl
        overflow-hidden
        border border-ink/10
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >

      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden bg-ink/5">

        {flyerUrl ? (

          <img
            src={flyerUrl}
            alt={event.title || "Event"}
            className="
              w-full
              h-full
              object-cover
              group-hover:scale-105
              transition-transform
              duration-500
            "
          />

        ) : (

          <div className="w-full h-full flex items-center justify-center bg-ink text-paper/30 font-display text-6xl">
            {event.title?.charAt(0) || "E"}
          </div>

        )}

        {/* IMAGE OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* CATEGORY */}
        <div className="absolute top-4 left-4">

          <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-ink text-xs font-semibold">
            {event.category || "General"}
          </span>

        </div>

        {/* PRICE */}
        <div className="absolute bottom-4 right-4">

          <span className="px-3 py-1.5 rounded-lg bg-ink/90 text-paper text-sm font-mono">
            {event.price > 0
              ? `$${Number(event.price).toFixed(2)}`
              : "Free"}
          </span>

        </div>

      </div>


      {/* CONTENT */}
      <div className="p-5">

        <h3 className="font-display text-xl font-semibold leading-tight group-hover:text-amber transition">
          {event.title || "Untitled Event"}
        </h3>


        <div className="mt-4 space-y-2.5">

          <div className="flex items-center gap-2 text-sm text-slate-muted">

            <FaCalendarAlt className="text-amber shrink-0" />

            <span>
              {formatDate(event.startDate)}
            </span>

          </div>


          <div className="flex items-center gap-2 text-sm text-slate-muted">

            <FaMapMarkerAlt className="text-amber shrink-0" />

            <span className="truncate">
              {event.venue || "Venue not specified"}
            </span>

          </div>

        </div>


        {/* FOOTER */}
        <div className="mt-5 pt-4 border-t border-ink/10 flex items-center justify-between">

          <span
            className={`text-xs font-medium ${
              (event.seatsAvailable ?? 0) > 0
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {(event.seatsAvailable ?? 0) > 0
              ? `${event.seatsAvailable} seats available`
              : "Sold out"}
          </span>


          <span className="flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-amber transition">

            View event

            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />

          </span>

        </div>

      </div>

    </Link>
  );
};

export default EventCard;