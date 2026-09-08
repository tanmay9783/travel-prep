import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import TripCard from "./TripCard";
import { createBackupData, validateBackupData, mergeTrips } from "../utils/backup";

export default function TripsDashboard({ trips, onDeleteTrip, onImportReplace, onImportAdd, setStatusMessage }) {
  const [pendingImport, setPendingImport] = useState(null);
  const fileInputRef = useRef(null);

  function handleDeleteClick(tripId) {
    if (window.confirm("Are you sure you want to delete this trip? All items will be lost.")) {
      onDeleteTrip(tripId);
    }
  }

  function handleExport() {
    const backupStr = createBackupData(trips);
    const blob = new Blob([backupStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travel-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (setStatusMessage) setStatusMessage("Backup exported successfully.");
  }

  async function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      if (setStatusMessage) setStatusMessage("This backup file is too large to import.");
      e.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      const importedTrips = validateBackupData(text);
      setPendingImport(importedTrips);
    } catch (err) {
      if (setStatusMessage) setStatusMessage(err.message);
    } finally {
      e.target.value = "";
    }
  }

  function confirmReplace() {
    onImportReplace(pendingImport);
    setPendingImport(null);
  }

  function confirmAdd() {
    const merged = mergeTrips(trips, pendingImport);
    onImportAdd(merged, pendingImport.length);
    setPendingImport(null);
  }

  function cancelImport() {
    setPendingImport(null);
    if (setStatusMessage) setStatusMessage("Backup import cancelled.");
  }

  return (
    <div style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "2rem" }}>
        <h2 style={{ fontSize: "3rem", color: "#5a3e2b" }}>My Trips</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button onClick={handleExport} style={{ backgroundColor: "#5a3e2b", color: "white" }}>
            Export Backup
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ backgroundColor: "#5a3e2b", color: "white" }}>
            Import Backup
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            style={{ display: "none" }} 
            aria-label="Choose a Travel Prep JSON backup"
          />
          <Link to="/trips/new" style={{ backgroundColor: "#e5771f", color: "white", padding: "1.2rem 2.4rem", borderRadius: "10rem", textDecoration: "none", fontSize: "1.6rem", fontWeight: 700, display: "inline-block" }}>
            + Create Trip
          </Link>
        </div>
      </div>

      {pendingImport && (
        <div style={{ backgroundColor: "#fff3cd", padding: "2rem", borderRadius: "8px", marginBottom: "3rem", border: "1px solid #ffeeba" }}>
          <h3 style={{ fontSize: "2rem", color: "#856404", marginBottom: "1rem" }}>Import {pendingImport.length} trip(s)?</h3>
          <p style={{ fontSize: "1.4rem", color: "#856404", marginBottom: "2rem" }}>Choose how you would like to import this backup.</p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={confirmReplace} style={{ backgroundColor: "#dc3545", color: "white" }}>Replace Existing Trips</button>
            <button onClick={confirmAdd} style={{ backgroundColor: "#28a745", color: "white" }}>Add to Existing Trips</button>
            <button onClick={cancelImport} style={{ backgroundColor: "#6c757d", color: "white" }}>Cancel</button>
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <div style={{ textAlign: "center", backgroundColor: "#ffebb3", padding: "4rem", borderRadius: "8px", marginTop: "2rem" }}>
          <p style={{ fontSize: "2rem", color: "#5a3e2b", marginBottom: "2rem" }}>No trips yet.</p>
          <p style={{ fontSize: "1.6rem", color: "#5a3e2b", marginBottom: "2rem" }}>Create your first trip to start packing.</p>
          <Link to="/trips/new" style={{ backgroundColor: "#76c7ad", color: "white", padding: "1.2rem 2.4rem", borderRadius: "4px", textDecoration: "none", fontSize: "1.6rem", display: "inline-block" }}>
            Create Trip
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {trips.map(trip => (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              onDelete={handleDeleteClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
