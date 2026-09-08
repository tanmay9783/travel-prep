import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBackupData, validateBackupData, mergeTrips } from './backup';

describe('Backup Utilities', () => {
  beforeEach(() => {
    let idCounter = 0;
    vi.stubGlobal('crypto', { randomUUID: () => `test-uuid-${idCounter++}` });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validTrips = [
    {
      id: "trip-1",
      name: "Goa",
      destination: "Goa, India",
      startDate: "2026-10-01",
      endDate: "2026-10-05",
      templateId: null,
      createdAt: "2026-09-08T00:00:00Z",
      updatedAt: "2026-09-08T00:00:00Z",
      items: [
        { id: "item-1", description: "Hat", quantity: 1, packed: false, category: "CLOTHING" }
      ]
    }
  ];

  describe('createBackupData', () => {
    it('creates a valid versioned JSON export', () => {
      const jsonStr = createBackupData(validTrips);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.format).toBe('travel-prep');
      expect(parsed.version).toBe(1);
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.trips).toEqual(validTrips);
    });

    it('exports empty array when no trips provided', () => {
      const jsonStr = createBackupData(null);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.trips).toEqual([]);
    });
  });

  describe('validateBackupData', () => {
    it('validates and returns normalized trips for a valid backup', () => {
      const validJson = createBackupData(validTrips);
      const trips = validateBackupData(validJson);
      expect(trips).toHaveLength(1);
      expect(trips[0].name).toBe("Goa");
      expect(trips[0].items[0].description).toBe("Hat");
    });

    it('normalizes invalid categories to MISC', () => {
      const badCatJson = JSON.stringify({
        format: "travel-prep", version: 1, trips: [
          { name: "Trip", items: [{ description: "Thing", quantity: 1, category: "MAGIC" }] }
        ]
      });
      const trips = validateBackupData(badCatJson);
      expect(trips[0].items[0].category).toBe("MISC");
    });

    it('rejects invalid JSON', () => {
      expect(() => validateBackupData('{ bad: json')).toThrow("Invalid backup file. The file is not valid JSON.");
    });

    it('rejects wrong format', () => {
      const wrongFormat = JSON.stringify({ format: "other-app", version: 1, trips: [] });
      expect(() => validateBackupData(wrongFormat)).toThrow("Wrong format.");
    });

    it('rejects unsupported versions', () => {
      const futureVersion = JSON.stringify({ format: "travel-prep", version: 99, trips: [] });
      expect(() => validateBackupData(futureVersion)).toThrow("newer version");
    });

    it('rejects malformed trips (missing name)', () => {
      const badTrip = JSON.stringify({ format: "travel-prep", version: 1, trips: [{ items: [] }] });
      expect(() => validateBackupData(badTrip)).toThrow("A trip name is missing");
    });

    it('rejects invalid date ranges', () => {
      const badDates = JSON.stringify({
        format: "travel-prep", version: 1, trips: [
          { name: "Trip", startDate: "2026-10-05", endDate: "2026-10-01", items: [] }
        ]
      });
      expect(() => validateBackupData(badDates)).toThrow("Invalid date range in trip: Trip.");
    });

    it('rejects missing description in items', () => {
      const badItem = JSON.stringify({
        format: "travel-prep", version: 1, trips: [
          { name: "Trip", items: [{ quantity: 1 }] }
        ]
      });
      expect(() => validateBackupData(badItem)).toThrow("Description missing.");
    });

    it('rejects invalid item quantity', () => {
      const badQty = JSON.stringify({
        format: "travel-prep", version: 1, trips: [
          { name: "Trip", items: [{ description: "Thing", quantity: -5 }] }
        ]
      });
      expect(() => validateBackupData(badQty)).toThrow("Invalid quantity");
    });
    
    it('ignores unknown fields', () => {
      const extraFields = JSON.stringify({
        format: "travel-prep", version: 1, extraTop: 1, trips: [
          { name: "Trip", extraTrip: 2, items: [{ description: "Thing", quantity: 1, extraItem: 3 }] }
        ]
      });
      const trips = validateBackupData(extraFields);
      expect(trips[0].extraTrip).toBeUndefined();
      expect(trips[0].items[0].extraItem).toBeUndefined();
      expect(trips[0].name).toBe("Trip");
    });
  });

  describe('mergeTrips', () => {
    it('generates new IDs for imported trips and items to avoid collisions', () => {
      const existing = [{ id: "ex-1", items: [{ id: "ex-item-1" }] }];
      const imported = [{ id: "imp-1", items: [{ id: "imp-item-1" }] }];
      
      const merged = mergeTrips(existing, imported);
      expect(merged).toHaveLength(2);
      expect(merged[0].id).toBe("ex-1"); // existing preserved
      expect(merged[1].id).toBe("test-uuid-0"); // new ID
      expect(merged[1].items[0].id).toBe("test-uuid-1"); // new item ID
    });
  });
});
