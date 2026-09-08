import { useState } from "react";
import { CATEGORIES } from "../data/categories";

export default function Form({ onAddItems }) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("MISC");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedDescription = description.trim();
    const parsedQuantity = parseInt(quantity, 10);
    
    if (!trimmedDescription) {
      setError("Item name cannot be empty.");
      return;
    }
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be at least 1.");
      return;
    }
    
    setError("");
    const newItem = {
      description: trimmedDescription,
      quantity: parsedQuantity,
      packed: false,
      category,
      id: crypto.randomUUID(),
    };

    onAddItems(newItem);

    setDescription("");
    setQuantity(1);
  }
  return (
    <form className="add-form flex flex-wrap justify-center items-center gap-sm" onSubmit={handleSubmit} style={{ backgroundColor: "var(--color-primary)", padding: "var(--spacing-lg) 0" }}>
      <h3 className="section-title text-center" style={{ margin: "0 var(--spacing-md) 0 0", color: "var(--bg-page)" }}>What do you need for your 😍 trip?</h3>
      <input
        type="number"
        aria-label="Item quantity"
        value={quantity}
        min="1"
        step="1"
        onChange={(e) => setQuantity(e.target.value)}
        className="input"
        style={{ width: "80px" }}
      />
      <input
        type="text"
        aria-label="Item description"
        placeholder="Item..."
        value={description}
        className="input"
        style={{ width: "auto" }}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select 
        aria-label="Item category" 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        className="select"
        style={{ width: "auto" }}
      >
        {Object.entries(CATEGORIES).map(([key, value]) => (
          <option key={key} value={key}>{value}</option>
        ))}
      </select>
      <button type="submit" className="btn btn-secondary">Add</button>
      {error && <div className="text-center w-full" style={{ color: "var(--bg-page)", marginTop: "10px", fontSize: "1.4rem", fontWeight: "bold" }}>{error}</div>}
    </form>
  );
}
