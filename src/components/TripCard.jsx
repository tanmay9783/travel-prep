import { Link } from "react-router-dom";

export default function TripCard({ trip, onDelete }) {
  const numItems = trip.items.length;
  const numPacked = trip.items.filter((item) => item.packed).length;
  const percentage = numItems > 0 ? Math.round((numPacked / numItems) * 100) : 0;

  return (
    <div style={{ 
      backgroundColor: "#ffebb3", 
      color: "#5a3e2b", 
      padding: "2rem", 
      borderRadius: "8px", 
      display: "flex", 
      flexDirection: "column", 
      gap: "1rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    }}>
      <h3 style={{ margin: 0, fontSize: "2.4rem" }}>{trip.name}</h3>
      
      {trip.destination && (
        <div style={{ fontSize: "1.6rem" }}>📍 {trip.destination}</div>
      )}
      
      {(trip.startDate || trip.endDate) && (
        <div style={{ fontSize: "1.6rem" }}>
          📅 {trip.startDate || "?"} to {trip.endDate || "?"}
        </div>
      )}

      <div style={{ fontSize: "1.6rem", marginTop: "1rem" }}>
        {numItems} items • {percentage}% packed
      </div>
      <progress value={numPacked} max={numItems} style={{ width: "100%", height: "1rem" }} />

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Link to={`/trips/${trip.id}`} style={{ flex: 1, backgroundColor: "#76c7ad", fontSize: "1.4rem", padding: "0.8rem", textDecoration: "none", color: "inherit", textAlign: "center", borderRadius: "2px" }}>Open</Link>
        <Link to={`/trips/${trip.id}/edit`} style={{ flex: 1, backgroundColor: "#e5771f", fontSize: "1.4rem", padding: "0.8rem", textDecoration: "none", color: "inherit", textAlign: "center", borderRadius: "2px" }}>Edit</Link>
        <button onClick={() => onDelete(trip.id)} style={{ flex: 1, backgroundColor: "#d32f2f", color: "white", fontSize: "1.4rem", padding: "0.8rem" }}>Delete</button>
      </div>
    </div>
  );
}
