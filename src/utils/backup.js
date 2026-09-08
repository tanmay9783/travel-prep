import { CATEGORIES } from "../data/categories";

const CURRENT_VERSION = 1;

export function createBackupData(trips) {
  return JSON.stringify({
    format: "travel-prep",
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    trips: trips || []
  }, null, 2);
}

export function validateBackupData(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Invalid backup file. The file is not valid JSON.");
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error("Invalid backup file format.");
  }

  if (parsed.format !== "travel-prep") {
    throw new Error("Wrong format. This is not a travel prep backup.");
  }

  if (parsed.version > CURRENT_VERSION) {
    throw new Error("This backup was created by a newer version of Travel Prep and cannot be imported yet.");
  }

  if (!Array.isArray(parsed.trips)) {
    throw new Error("Invalid backup file. Trips data is missing or malformed.");
  }

  // Validate each trip and normalize
  const normalizedTrips = [];
  for (const trip of parsed.trips) {
    if (!trip || typeof trip !== 'object' || Array.isArray(trip)) {
      throw new Error("Malformed trip found in backup.");
    }
    if (!trip.name || typeof trip.name !== 'string' || !trip.name.trim()) {
      throw new Error("Malformed trip found. A trip name is missing or invalid.");
    }
    
    // Dates validation
    const startDate = typeof trip.startDate === 'string' ? trip.startDate : null;
    const endDate = typeof trip.endDate === 'string' ? trip.endDate : null;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error(`Invalid date range in trip: ${trip.name}.`);
    }

    if (!Array.isArray(trip.items)) {
      throw new Error(`Malformed trip found: ${trip.name} has invalid items.`);
    }

    const normalizedItems = [];
    for (const item of trip.items) {
      if (!item || typeof item !== 'object') {
        throw new Error(`Malformed item found in trip: ${trip.name}.`);
      }
      if (!item.description || typeof item.description !== 'string' || !item.description.trim()) {
        throw new Error(`Malformed item found in trip: ${trip.name}. Description missing.`);
      }
      
      let quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity for item '${item.description}' in trip: ${trip.name}.`);
      }

      // Safe category normalization
      let category = item.category;
      if (!category || !CATEGORIES[category]) {
        category = "MISC";
      }

      normalizedItems.push({
        id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
        description: item.description.trim(),
        quantity,
        packed: Boolean(item.packed),
        category
      });
    }

    normalizedTrips.push({
      id: typeof trip.id === 'string' && trip.id ? trip.id : crypto.randomUUID(),
      name: trip.name.trim(),
      destination: typeof trip.destination === 'string' ? trip.destination.trim() : "",
      startDate,
      endDate,
      templateId: typeof trip.templateId === 'string' ? trip.templateId : null,
      createdAt: typeof trip.createdAt === 'string' ? trip.createdAt : new Date().toISOString(),
      updatedAt: typeof trip.updatedAt === 'string' ? trip.updatedAt : new Date().toISOString(),
      items: normalizedItems
    });
  }

  return normalizedTrips;
}

export function mergeTrips(existingTrips, importedTrips) {
  // Regenerate UUIDs for imported trips and items to prevent collisions
  const safeImportedTrips = importedTrips.map(trip => ({
    ...trip,
    id: crypto.randomUUID(),
    items: trip.items.map(item => ({
      ...item,
      id: crypto.randomUUID()
    }))
  }));

  return [...existingTrips, ...safeImportedTrips];
}
