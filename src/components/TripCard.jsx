import { Link } from "react-router-dom";

export default function TripCard({ trip, onDelete }) {
  const numItems = trip.items.length;
  const numPacked = trip.items.filter((item) => item.packed).length;
  const percentage = numItems > 0 ? Math.round((numPacked / numItems) * 100) : 0;

  return (
    <div className="card flex flex-col gap-sm">
      <h3 className="section-title" style={{ margin: 0 }}>{trip.name}</h3>
      <div className="text-muted flex flex-col gap-xs mt-sm">
        {trip.destination && (
          <div>📍 {trip.destination}</div>
        )}
        {trip.startDate && (
          <div>
            📅 {new Date(trip.startDate).toLocaleDateString()} 
            {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
          </div>
        )}
      </div>

      <div className="mt-sm">
        <strong>{numItems}</strong> items &bull; <strong>{percentage}</strong>% packed
      </div>
      
      <progress value={numPacked} max={numItems} className="w-full" style={{ height: "0.8rem", accentColor: "var(--color-primary)" }} />
      
      <div className="flex gap-sm mt-sm">
        <Link to={`/trips/${trip.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Open</Link>
        <Link to={`/trips/${trip.id}/edit`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Edit</Link>
        <button onClick={() => onDelete(trip.id)} className="btn btn-destructive btn-sm" style={{ flex: 1 }}>Delete</button>
      </div>
    </div>
  );
}
