import { Link } from "react-router-dom";
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
    <div>
      <div className="flex items-center gap-md" style={{ padding: "var(--spacing-md)", backgroundColor: "var(--bg-surface-header)", boxShadow: "var(--shadow-sm)" }}>
        <button onClick={onBack} className="btn-icon" style={{ fontSize: "var(--font-size-md)", fontWeight: "bold" }}>
          ← Back to Trips
        </button>
        <h2 className="section-title text-center" style={{ flex: 1, margin: 0, color: "var(--text-header)" }}>
          {trip.name} {trip.destination && <span className="text-muted" style={{ fontSize: "var(--font-size-base)" }}>({trip.destination})</span>}
        </h2>
        <div className="flex items-center gap-sm">
          <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "bold", color: "var(--text-header)" }}>{percentage}% packed</span>
          <Link to={`/trips/${trip.id}/edit`} className="btn btn-primary btn-sm">
            Edit
          </Link>
        </div>
      </div>
      

      
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
