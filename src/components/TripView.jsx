import { Link } from "react-router-dom";
import Logo from "./Logo";
import Form from "./Form";
import PackingList from "./PackingList";
import Stats from "./Stats";

export default function TripView({
  trip,
  onBack,
  onAddItems,
  onDeleteItem,
  onToggleItem,
  onEditItem,
  onClearList,
  onClearCompleted,
  onReorderItem,
}) {
  const numItems = trip.items.length;
  const numPacked = trip.items.filter((item) => item.packed).length;
  const percentage = numItems > 0 ? Math.round((numPacked / numItems) * 100) : 0;

  return (
    <div className="app">
      <div style={{ padding: "1rem", backgroundColor: "#e5771f", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={onBack} style={{ backgroundColor: "transparent", border: "none", color: "#5a3e2b", cursor: "pointer", fontSize: "1.6rem" }}>
          ← Back to Trips
        </button>
        <h2 style={{ flex: 1, textAlign: "center", color: "#5a3e2b", margin: 0, fontSize: "2rem" }}>
          {trip.name} {trip.destination && `(${trip.destination})`}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#5a3e2b", fontSize: "1.4rem", fontWeight: "bold" }}>{percentage}% packed</span>
          <Link to={`/trips/${trip.id}/edit`} style={{ backgroundColor: "#5a3e2b", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", textDecoration: "none", fontSize: "1.4rem" }}>
            Edit
          </Link>
        </div>
      </div>
      
      <Logo />
      
      <Form onAddItems={(item) => onAddItems(trip.id, item)} />
      
      <PackingList
        items={trip.items}
        onDeleteItem={(itemId) => onDeleteItem(trip.id, itemId)}
        onToggleItem={(itemId) => onToggleItem(trip.id, itemId)}
        onEditItem={(itemId, desc, qty, cat) => onEditItem(trip.id, itemId, desc, qty, cat)}
        onClearList={() => onClearList(trip.id)}
        onClearCompleted={() => onClearCompleted(trip.id)}
        onReorderItem={(sourceId, destId) => onReorderItem(trip.id, sourceId, destId)}
      />
      
      <Stats items={trip.items} />
    </div>
  );
}
