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
    <form className="card flex flex-col" onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "var(--spacing-xl) auto" }}>
      <h3 className="section-title" style={{ margin: "0 0 var(--spacing-md) 0" }}>{isEdit ? "Edit Trip" : "Create New Trip"}</h3>
      
      {error && <div style={{ color: "var(--color-danger)", marginBottom: "var(--spacing-md)", fontWeight: "bold" }}>{error}</div>}

      <div className="flex flex-col gap-md">
        <input
          type="text"
          placeholder="Trip Name *"
          aria-label="Trip Name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destination (Optional)"
          aria-label="Destination"
          className="input"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <div className="flex gap-sm">
          <input
            type="date"
            aria-label="Start Date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="date"
            aria-label="End Date"
            className="input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        
        {!isEdit && (
          <select 
            aria-label="Trip Template" 
            className="select"
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

        <div className="flex gap-sm mt-sm">
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEdit ? "Save Changes" : "Create Trip"}</button>
          <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
        </div>
      </div>
    </form>
  );
}
