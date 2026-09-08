import { describe, it, expect, beforeEach, vi } from 'vitest';
import { migrateLegacyData } from './migration';

describe('Migration Utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('does nothing if no legacy data exists', () => {
    migrateLegacyData();
    expect(window.localStorage.getItem('travel-prep-data')).toBeNull();
  });

  it('does nothing if legacy data is an empty array', () => {
    window.localStorage.setItem('trip-checklist-items', JSON.stringify([]));
    migrateLegacyData();
    expect(window.localStorage.getItem('travel-prep-data')).toBeNull();
  });

  it('safely ignores malformed legacy JSON without crashing', () => {
    window.localStorage.setItem('trip-checklist-items', '{"bad": json');
    migrateLegacyData();
    expect(window.localStorage.getItem('travel-prep-data')).toBeNull();
    expect(console.warn).toHaveBeenCalledWith("Legacy migration ignored malformed JSON");
  });

  it('does not crash if localStorage throws during item access', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error("Storage broken");
    });
    migrateLegacyData();
    expect(console.warn).toHaveBeenCalledWith("Migration failed:", expect.any(Error));
  });

  it('migrates legacy items into a default trip with MISC category', () => {
    const legacyItems = [
      { id: '1', description: 'Passport', quantity: 1, packed: false },
      { id: '2', description: 'ExistingCat', quantity: 2, packed: true, category: 'CLOTHING' }
    ];
    window.localStorage.setItem('trip-checklist-items', JSON.stringify(legacyItems));

    migrateLegacyData();

    const newDataStr = window.localStorage.getItem('travel-prep-data');
    expect(newDataStr).not.toBeNull();
    
    const newData = JSON.parse(newDataStr);
    expect(newData.trips).toHaveLength(1);
    expect(newData.trips[0].name).toBe('My Previous List');
    expect(newData.trips[0].items).toHaveLength(2);
    
    // Existing category should be preserved
    expect(newData.trips[0].items[1].category).toBe('CLOTHING');
    
    // Missing category should become MISC
    expect(newData.trips[0].items[0].category).toBe('MISC');
  });

  it('does not overwrite existing new data', () => {
    const legacyItems = [{ id: '1', description: 'Passport', quantity: 1, packed: false }];
    window.localStorage.setItem('trip-checklist-items', JSON.stringify(legacyItems));

    const existingData = { trips: [{ id: '123', name: 'Existing', items: [] }] };
    window.localStorage.setItem('travel-prep-data', JSON.stringify(existingData));

    migrateLegacyData();

    const newDataStr = window.localStorage.getItem('travel-prep-data');
    const newData = JSON.parse(newDataStr);
    expect(newData.trips[0].name).toBe('Existing');
  });
});
