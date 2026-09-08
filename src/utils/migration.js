export function migrateLegacyData() {
  if (typeof window === "undefined") return;

  try {
    const legacyDataString = window.localStorage.getItem("trip-checklist-items");
    const oldV1DataString = window.localStorage.getItem("trip-checklist-data");
    const newDataString = window.localStorage.getItem("travel-prep-data");

    // If new data already exists, no migration needed
    if (newDataString) return;

    // Migrate from v1 to new name
    if (oldV1DataString) {
      window.localStorage.setItem("travel-prep-data", oldV1DataString);
      // Don't delete old data immediately as a safety precaution
      return;
    }

    // If legacy v0 data exists, migrate it
    if (legacyDataString) {
      let legacyItems = null;
      try {
        legacyItems = JSON.parse(legacyDataString);
      } catch {
        console.warn("Legacy migration ignored malformed JSON");
        return; // Ignore malformed data
      }

      if (Array.isArray(legacyItems) && legacyItems.length > 0) {
        // Upgrade legacy items with default category
        const migratedItems = legacyItems.map(item => ({
          ...item,
          category: item.category || "MISC"
        }));

        const newTrip = {
          id: crypto.randomUUID(),
          name: "My Previous List",
          destination: "",
          startDate: null,
          endDate: null,
          templateId: null,
          items: migratedItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const initialData = {
          trips: [newTrip],
        };

        window.localStorage.setItem("travel-prep-data", JSON.stringify(initialData));
        // Note: we do not delete old data immediately as a safety precaution.
      }
    }
  } catch (err) {
    console.warn("Migration failed:", err);
  }
}

