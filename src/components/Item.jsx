import { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "../data/categories";

export default function Item({ item, onDeleteItem, onToggleItem, onEditItem, isReorderEnabled, onMoveUp, onMoveDown, onDropItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(item.description);
  const [editQty, setEditQty] = useState(item.quantity);
  const [editCat, setEditCat] = useState(item.category || "MISC");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  function handleSave(e) {
    e.preventDefault();
    const parsedQty = parseInt(editQty, 10);
    if (!editDesc.trim()) {
      setError("Item name cannot be empty.");
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("Quantity must be at least 1.");
      return;
    }
    setError("");
    onEditItem(item.id, editDesc.trim(), parsedQty, editCat);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li>
        <form onSubmit={handleSave} style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="number"
            min="1"
            step="1"
            value={editQty}
            onChange={(e) => setEditQty(e.target.value)}
            style={{ width: "60px", padding: "0.4rem" }}
            aria-label="Edit quantity"
          />
          <input
            type="text"
            ref={inputRef}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            style={{ padding: "0.4rem" }}
            aria-label="Edit description"
          />
          <select 
            aria-label="Edit category" 
            value={editCat} 
            onChange={(e) => setEditCat(e.target.value)}
            style={{ padding: "0.4rem" }}
          >
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
          <button type="submit" aria-label="Save item">💾</button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setEditDesc(item.description);
              setEditQty(item.quantity);
              setEditCat(item.category || "MISC");
              setError("");
            }}
            aria-label="Cancel edit"
          >
            ❌
          </button>
          {error && <span style={{color: "#ffc107", fontSize: "1.4rem", width: "100%"}}>{error}</span>}
        </form>
      </li>
    );
  }

  return (
    <li
      draggable={isReorderEnabled}
      onDragStart={(e) => {
        if (!isReorderEnabled) return;
        e.dataTransfer.setData("application/json", JSON.stringify({ id: item.id, category: item.category }));
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        if (!isReorderEnabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        if (!isReorderEnabled) return;
        e.preventDefault();
        try {
          const data = JSON.parse(e.dataTransfer.getData("application/json"));
          if (data && data.id && data.id !== item.id && data.category === item.category) {
            onDropItem(data.id);
          }
        } catch {
          // ignore invalid payload
        }
      }}
      style={{ cursor: isReorderEnabled ? "grab" : "default" }}
    >
      {isReorderEnabled && (
        <span style={{ marginRight: "0.5rem", cursor: "grab", opacity: 0.5 }} aria-hidden="true">
          ☷
        </span>
      )}
      <input
        type="checkbox"
        checked={item.packed}
        aria-label={`Mark ${item.description} as ${item.packed ? 'unpacked' : 'packed'}`}
        onChange={() => onToggleItem(item.id)}
      />
      <span style={item.packed ? { textDecoration: "line-through" } : {}}>
        {item.quantity} {item.description}
      </span>
      
      {isReorderEnabled && (
        <>
          <button
            type="button"
            aria-label={`Move ${item.description} up`}
            onClick={onMoveUp}
            disabled={!onMoveUp}
            style={{ padding: "0.2rem 0.6rem", fontSize: "1.2rem", opacity: onMoveUp ? 1 : 0.3 }}
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Move ${item.description} down`}
            onClick={onMoveDown}
            disabled={!onMoveDown}
            style={{ padding: "0.2rem 0.6rem", fontSize: "1.2rem", opacity: onMoveDown ? 1 : 0.3 }}
          >
            ↓
          </button>
        </>
      )}

      <button
        aria-label={`Edit ${item.description}`}
        type="button"
        onClick={() => setIsEditing(true)}
      >
        ✏️
      </button>
      <button
        aria-label={`Delete ${item.description}`}
        type="button"
        onClick={() => onDeleteItem(item.id)}
      >
        ❌
      </button>
    </li>
  );
}
