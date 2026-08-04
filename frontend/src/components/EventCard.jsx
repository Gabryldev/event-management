import { Link } from "react-router-dom";

const formatDate = (d) => {
  if (!d) return "Date not available";

  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventCard = ({ event }) => {
  if (!event) return null;

const API_URL = "https://event-management-14xr.onrender.com";

const flyerUrl = event.flyer?.url
  ? `${API_URL}${event.flyer.url}`
  : null;
console.log(event.flyer);
  return (
    <Link
      to={`/events/${event._id}`}
      className="card overflow-hidden group hover:shadow-md transition-shadow"
    >
      <div className="h-40 bg-ink/5 overflow-hidden">
        {flyerUrl ? (
          <img
            src={flyerUrl}
            alt={event.title || "Event"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/20 font-display text-3xl">
            {event.title?.charAt(0) || "E"}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="eyebrow mb-1">
          {event.category || "General"}
        </p>

        <h3 className="font-display text-lg font-semibold">
          {event.title || "Untitled Event"}
        </h3>

        <p className="text-sm text-slate-muted mb-2">
          {formatDate(event.startDate)} · {event.venue || "Unknown Venue"}
        </p>

        <div className="flex justify-between">
          <span className="font-mono text-sm">
            {event.price > 0 ? `$${event.price.toFixed(2)}` : "Free"}
          </span>

          <span className="text-xs text-slate-muted">
            {(event.seatsAvailable ?? 0) > 0
              ? `${event.seatsAvailable} seats left`
              : "Sold out"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;