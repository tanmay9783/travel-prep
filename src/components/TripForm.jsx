import { useState } from "react";
import { TEMPLATES } from "../data/templates";

export default function TripForm({ onSubmit, onCancel, initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [destination, setDestination] = useState(initialData?.destination || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [templateId, setTemplateId] = useState(initialData?.templateId || "blank");
  const [error, setError] = useState("");

  const isEdit = !!initialData;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Trip name is required.");
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");

    onSubmit({
      name: trimmedName,
      destination: destination.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      templateId,
    });
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} style={{ flexDirection: "column", alignItems: "stretch", maxWidth: "500px", margin: "2rem auto", backgroundColor: "#f4a226", padding: "2rem", borderRadius: "8px" }}>
      <h3 style={{ margin: "0 0 1rem 0", color: "#5a3e2b" }}>{isEdit ? "Edit Trip" : "Create New Trip"}</h3>
      
      {error && <div style={{ color: "#d32f2f", marginBottom: "1rem", fontWeight: "bold" }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Trip Name *"
          aria-label="Trip Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destination (Optional)"
          aria-label="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            type="date"
            aria-label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="date"
            aria-label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        
        {!isEdit && (
          <select 
            aria-label="Trip Template" 
            value={templateId} 
            onChange={(e) => setTemplateId(e.target.value)}
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} - {t.description}
              </option>
            ))}
          </select>
        )}

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit" style={{ flex: 1 }}>{isEdit ? "Save Changes" : "Create Trip"}</button>
          <button type="button" onClick={onCancel} style={{ flex: 1, backgroundColor: "#ffebb3", color: "#5a3e2b" }}>Cancel</button>
        </div>
      </div>
    </form>
  );
}
