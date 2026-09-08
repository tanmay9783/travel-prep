import { useState } from "react";
import Item from "./Item";
import { CATEGORIES } from "../data/categories";

export default function PackingList({
  items,
  onDeleteItem,
  onToggleItem,
  onEditItem,
  onClearList,
  onClearCompleted,
  onReorderItem,
}) {
  const [sortBy, setSortBy] = useState("input");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  let filteredItems = items;
  if (searchQuery) {
    filteredItems = filteredItems.filter(item => 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (filterCategory !== "ALL") {
    filteredItems = filteredItems.filter(item => item.category === filterCategory);
  }

  let sortedItems;

  if (sortBy === "input") sortedItems = filteredItems;

  if (sortBy === "description")
    sortedItems = filteredItems
      .slice()
      .sort((a, b) => a.description.localeCompare(b.description));

  if (sortBy === "unpacked")
    sortedItems = filteredItems
      .slice()
      .sort((a, b) => Number(a.packed) - Number(b.packed));

  if (sortBy === "packed")
    sortedItems = filteredItems
      .slice()
      .sort((a, b) => Number(b.packed) - Number(a.packed));

  // Group by category
  const groupedItems = sortedItems.reduce((acc, item) => {
    const cat = item.category || "MISC";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const displayedCategories = Object.keys(groupedItems).sort();

  const isReorderEnabled = sortBy === "input" && filterCategory === "ALL" && !searchQuery;

  return (
    <div className="list">
      <div className="search-actions" style={{ padding: "0 0 2rem 0", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem", width: "100%" }}>
        <input 
          type="search" 
          placeholder="Search items..." 
          aria-label="Search items"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "0.8rem 2.4rem", borderRadius: "10rem", border: "none", fontSize: "1.4rem", width: "80%", maxWidth: "300px" }}
        />
        <select 
          aria-label="Filter by category" 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "0.8rem 2.4rem", borderRadius: "10rem", border: "none", fontSize: "1.4rem", maxWidth: "200px" }}
        >
          <option value="ALL">All Categories</option>
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "2rem", marginTop: "2rem", color: "#ffebb3" }}>
          No items yet. Add your first packing item above.
        </p>
      ) : sortedItems.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "2rem", marginTop: "2rem", color: "#ffebb3" }}>
          No matching items.
        </p>
      ) : (
        <div style={{ width: "80%", maxWidth: "800px", margin: "0 auto" }}>
          {displayedCategories.map(cat => (
            <div key={cat} style={{ marginBottom: "2rem" }}>
              <h3 style={{ borderBottom: "1px solid #ffebb3", paddingBottom: "0.5rem", marginBottom: "1rem", color: "#ffebb3" }}>
                {CATEGORIES[cat] || "Other"} <span style={{ fontSize: "1.4rem", fontWeight: "normal" }}>({groupedItems[cat].length})</span>
              </h3>
              <ul style={{ width: "100%" }}>
                {groupedItems[cat].map((item, index, arr) => (
                  <Item
                    item={item}
                    key={item.id}
                    onDeleteItem={onDeleteItem}
                    onToggleItem={onToggleItem}
                    onEditItem={onEditItem}
                    isReorderEnabled={isReorderEnabled}
                    onMoveUp={index > 0 ? () => onReorderItem(item.id, arr[index - 1].id) : null}
                    onMoveDown={index < arr.length - 1 ? () => onReorderItem(item.id, arr[index + 1].id) : null}
                    onDropItem={(sourceId) => onReorderItem(sourceId, item.id)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <select aria-label="Sort items" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="input">Sort by input order</option>
          <option value="description">Sort by description (A-Z)</option>
          <option value="unpacked">Sort by unpacked first</option>
          <option value="packed">Sort by packed first</option>
        </select>
        <button type="button" onClick={onClearCompleted}>Clear Completed</button>
        <button type="button" onClick={onClearList}>Clear List</button>
      </div>
    </div>
  );
}
