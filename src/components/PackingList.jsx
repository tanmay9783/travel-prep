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
      <div className="container-sm w-full flex justify-center gap-sm flex-wrap" style={{ padding: "0 var(--spacing-md) var(--spacing-lg) var(--spacing-md)" }}>
        <input 
          type="search" 
          placeholder="Search items..." 
          aria-label="Search items"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ width: "100%", maxWidth: "300px" }}
        />
        <select 
          aria-label="Filter by category" 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="select"
          style={{ width: "100%", maxWidth: "200px" }}
        >
          <option value="ALL">All Categories</option>
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <p className="text-center section-title text-inverse-muted mt-lg">
          No items yet. Add your first packing item above.
        </p>
      ) : sortedItems.length === 0 ? (
        <p className="text-center section-title text-inverse-muted mt-lg">
          No matching items.
        </p>
      ) : (
        <div className="container-sm w-full">
          {displayedCategories.map(cat => (
            <div key={cat} style={{ marginBottom: "var(--spacing-xl)" }}>
              <h3 className="section-title" style={{ borderBottom: "1px solid var(--border-default)", paddingBottom: "var(--spacing-xs)", marginBottom: "var(--spacing-md)", color: "var(--text-inverse-muted)" }}>
                {CATEGORIES[cat] || "Other"} <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: "normal" }}>({groupedItems[cat].length})</span>
              </h3>
              <ul className="w-full">
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

      <div className="actions flex flex-wrap gap-sm justify-center mt-lg container-sm w-full">
        <select aria-label="Sort items" className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: "auto" }}>
          <option value="input">Sort by input order</option>
          <option value="description">Sort by description (A-Z)</option>
          <option value="unpacked">Sort by unpacked first</option>
          <option value="packed">Sort by packed first</option>
        </select>
        <button type="button" className="btn btn-outline" style={{ color: "var(--text-inverse-muted)" }} onClick={onClearCompleted}>Clear Completed</button>
        <button type="button" className="btn btn-outline" style={{ color: "var(--text-inverse-muted)" }} onClick={onClearList}>Clear List</button>
      </div>
    </div>
  );
}
