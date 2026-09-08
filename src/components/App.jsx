import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { migrateLegacyData } from "../utils/migration";
import TripsDashboard from "./TripsDashboard";
import TripView from "./TripView";
import TripForm from "./TripForm";
import { TEMPLATES } from "../data/templates";

export default function App() {
  const [data, setData] = useLocalStorage("travel-prep-data", {
    trips: [],
  });
  const [statusMessage, setStatusMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    migrateLegacyData();
  }, []);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const safeData = data || {};
  const trips = safeData.trips || [];

  function handleCreateTrip(tripData) {
    let newItems = [];
    if (tripData.templateId && tripData.templateId !== "blank") {
      const template = TEMPLATES.find((t) => t.id === tripData.templateId);
      if (template) {
        newItems = template.items.map((item) => ({
          ...item,
          packed: false,
          id: crypto.randomUUID(),
        }));
      }
    }

    const newTrip = {
      ...tripData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: newItems,
    };

    setData((d) => ({
      trips: [...(d.trips || []), newTrip],
    }));
    setStatusMessage(`Created trip ${newTrip.name}`);
    navigate(`/trips/${newTrip.id}`);
  }

  function handleEditTrip(updatedTrip) {
    setData((d) => ({
      ...d,
      trips: d.trips.map((t) => (t.id === updatedTrip.id ? { ...t, ...updatedTrip, updatedAt: new Date().toISOString() } : t)),
    }));
    setStatusMessage(`Updated trip ${updatedTrip.name}`);
    navigate(`/trips/${updatedTrip.id}`);
  }

  function handleDeleteTrip(tripId) {
    setData((d) => {
      const remainingTrips = d.trips.filter((t) => t.id !== tripId);
      return {
        trips: remainingTrips,
      };
    });
    setStatusMessage("Trip deleted.");
  }

  function handleImportReplace(importedTrips) {
    setData({
      trips: importedTrips,
    });
    setStatusMessage(`Imported ${importedTrips.length} trips successfully. Existing trips replaced.`);
    navigate("/");
  }

  function handleImportAdd(mergedTrips, addedCount) {
    setData((d) => ({
      ...d,
      trips: mergedTrips,
    }));
    setStatusMessage(`Added ${addedCount} trips successfully.`);
    navigate("/");
  }

  // Checklist Actions
  function updateTripItems(tripId, updateFn) {
    setData((d) => ({
      ...d,
      trips: d.trips.map((t) => 
        t.id === tripId 
          ? { ...t, items: updateFn(t.items), updatedAt: new Date().toISOString() } 
          : t
      )
    }));
  }

  function handleAddItems(tripId, item) {
    updateTripItems(tripId, (items) => [...items, item]);
    setStatusMessage(`Added ${item.description}`);
  }

  function handleDeleteItem(tripId, itemId) {
    updateTripItems(tripId, (items) => {
      const item = items.find((i) => i.id === itemId);
      if (item) setStatusMessage(`Deleted ${item.description}`);
      return items.filter((i) => i.id !== itemId);
    });
  }

  function handleReorderItem(tripId, sourceId, destinationId) {
    updateTripItems(tripId, (items) => {
      const sourceIndex = items.findIndex(i => i.id === sourceId);
      const destIndex = items.findIndex(i => i.id === destinationId);
      if (sourceIndex === -1 || destIndex === -1 || sourceIndex === destIndex) return items;
      
      const newItems = [...items];
      const [removed] = newItems.splice(sourceIndex, 1);
      newItems.splice(destIndex, 0, removed);
      return newItems;
    });
  }

  function handleToggleItem(tripId, itemId) {
    updateTripItems(tripId, (items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      )
    );
  }

  function handleEditItem(tripId, itemId, newDescription, newQuantity, newCategory) {
    updateTripItems(tripId, (items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, description: newDescription, quantity: newQuantity, category: newCategory }
          : item
      )
    );
    setStatusMessage(`Updated ${newDescription}`);
  }

  function handleClearList(tripId) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip || trip.items.length === 0) return;
    if (window.confirm("Are you sure you want to delete all items?")) {
      updateTripItems(tripId, () => []);
      setStatusMessage("Checklist cleared.");
    }
  }

  function handleClearCompleted(tripId) {
    updateTripItems(tripId, (items) => items.filter((item) => !item.packed));
    setStatusMessage("Completed items cleared.");
  }

  return (
    <>
      <div aria-live="polite" className="sr-only" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>
        {statusMessage}
      </div>
      
      <Routes>
        <Route path="/" element={
          <TripsDashboard
            trips={trips}
            onDeleteTrip={handleDeleteTrip}
            onImportReplace={handleImportReplace}
            onImportAdd={handleImportAdd}
            setStatusMessage={setStatusMessage}
          />
        } />
        <Route path="/trips/new" element={
          <div style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
            <Link to="/" style={{ color: "#5a3e2b", fontSize: "1.6rem", textDecoration: "none", marginBottom: "2rem", display: "inline-block" }}>
              ← Back to Trips
            </Link>
            <TripForm onSubmit={handleCreateTrip} onCancel={() => navigate("/")} />
          </div>
        } />
        <Route path="/trips/:tripId" element={
          <TripViewRoute 
            trips={trips} 
            navigate={navigate} 
            handleAddItems={handleAddItems} 
            handleDeleteItem={handleDeleteItem} 
            handleToggleItem={handleToggleItem} 
            handleEditItem={handleEditItem} 
            handleClearList={handleClearList} 
            handleClearCompleted={handleClearCompleted} 
            handleReorderItem={handleReorderItem}
          />
        } />
        <Route path="/trips/:tripId/edit" element={
          <EditTripRoute trips={trips} navigate={navigate} handleEditTrip={handleEditTrip} />
        } />
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "#ffebb3", borderRadius: "8px", maxWidth: "600px", margin: "4rem auto" }}>
            <h2 style={{ fontSize: "2.4rem", color: "#5a3e2b", marginBottom: "1rem" }}>Page not found</h2>
            <p style={{ fontSize: "1.4rem", color: "#5a3e2b", marginBottom: "2rem" }}>The page you&apos;re looking for doesn&apos;t exist.</p>
            <Link to="/" style={{ backgroundColor: "#76c7ad", color: "white", padding: "1rem 2rem", textDecoration: "none", borderRadius: "4px", fontSize: "1.6rem" }}>Back to Trips</Link>
          </div>
        } />
      </Routes>
    </>
  );
}

// Route Wrapper Components
function TripViewRoute({ trips, navigate, handleAddItems, handleDeleteItem, handleToggleItem, handleEditItem, handleClearList, handleClearCompleted, handleReorderItem }) {
  const { tripId } = useParams();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "#ffebb3", borderRadius: "8px", maxWidth: "600px", margin: "4rem auto" }}>
        <h2 style={{ fontSize: "2.4rem", color: "#dc3545", marginBottom: "1rem" }}>Trip not found</h2>
        <p style={{ fontSize: "1.4rem", color: "#5a3e2b", marginBottom: "2rem" }}>This trip may have been deleted or the link may be invalid.</p>
        <Link to="/" style={{ backgroundColor: "#76c7ad", color: "white", padding: "1rem 2rem", textDecoration: "none", borderRadius: "4px", fontSize: "1.6rem" }}>Back to Trips</Link>
      </div>
    );
  }
  return (
    <TripView
      trip={trip}
      onBack={() => navigate("/")}
      onAddItems={handleAddItems}
      onDeleteItem={handleDeleteItem}
      onToggleItem={handleToggleItem}
      onEditItem={handleEditItem}
      onClearList={handleClearList}
      onClearCompleted={handleClearCompleted}
      onReorderItem={handleReorderItem}
    />
  );
}

function EditTripRoute({ trips, navigate, handleEditTrip }) {
  const { tripId } = useParams();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "#ffebb3", borderRadius: "8px", maxWidth: "600px", margin: "4rem auto" }}>
        <h2 style={{ fontSize: "2.4rem", color: "#dc3545", marginBottom: "1rem" }}>Trip not found</h2>
        <Link to="/" style={{ backgroundColor: "#76c7ad", color: "white", padding: "1rem 2rem", textDecoration: "none", borderRadius: "4px", fontSize: "1.6rem" }}>Back to Trips</Link>
      </div>
    );
  }
  return (
    <div style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link to={`/trips/${tripId}`} style={{ color: "#5a3e2b", fontSize: "1.6rem", textDecoration: "none", marginBottom: "2rem", display: "inline-block" }}>
        ← Back to Trip
      </Link>
      <TripForm initialData={trip} onSubmit={(data) => handleEditTrip({ ...trip, ...data })} onCancel={() => navigate(`/trips/${tripId}`)} />
    </div>
  );
}
