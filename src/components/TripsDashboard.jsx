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
    <div className="container">
      <div className="flex justify-between items-center flex-wrap gap-md" style={{ marginBottom: "var(--spacing-xl)" }}>
        <h2 className="page-title" style={{ margin: 0 }}>My Trips</h2>
        <div className="flex flex-wrap gap-sm">
          <button onClick={handleExport} className="btn btn-outline">
            Export Backup
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline">
            Import Backup
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            className="sr-only" 
            aria-label="Choose a Travel Prep JSON backup"
          />
          <Link to="/trips/new" className="btn btn-primary">
            + Create Trip
          </Link>
        </div>
      </div>

      {pendingImport && (
        <div className="card card-warning" style={{ marginBottom: "var(--spacing-xl)" }}>
          <h3 className="section-title" style={{ margin: 0, marginBottom: "var(--spacing-sm)" }}>Import {pendingImport.length} trip(s)?</h3>
          <p className="card-text text-muted" style={{ marginBottom: "var(--spacing-lg)" }}>Choose how you would like to import this backup.</p>
          <div className="flex flex-wrap gap-sm">
            <button onClick={confirmReplace} className="btn btn-destructive">Replace Existing Trips</button>
            <button onClick={confirmAdd} className="btn btn-primary">Add to Existing Trips</button>
            <button onClick={cancelImport} className="btn btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="card text-center" style={{ marginTop: "var(--spacing-lg)" }}>
          <p className="section-title">No trips yet.</p>
          <p className="text-muted" style={{ marginBottom: "var(--spacing-lg)" }}>Create your first trip to start packing.</p>
          <Link to="/trips/new" className="btn btn-secondary">
            Create Trip
          </Link>
        </div>
      ) : (
        <div className="grid-cards">
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
