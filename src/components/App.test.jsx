import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const renderApp = () => render(
  <MemoryRouter initialEntries={["/"]}>
    <App />
  </MemoryRouter>
);

async function createAndOpenTestTrip(user) {
  // Click create trip on empty dashboard
  await user.click(screen.getByRole('link', { name: /\+ create trip/i }));
  
  // Fill form
  const nameInput = screen.getByLabelText('Trip Name');
  await user.type(nameInput, 'Goa Trip');
  
  await user.click(screen.getByRole('button', { name: 'Create Trip' }));
}

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock randomUUID to have predictable IDs (use counter for uniqueness in same test)
    let idCounter = 0;
    vi.stubGlobal('crypto', { randomUUID: () => `test-uuid-${idCounter++}` });
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- DASHBOARD & TRIPS TESTS ---

  it('renders empty dashboard and creates a trip', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByText('No trips yet.')).toBeInTheDocument();

    await createAndOpenTestTrip(user);

    // Should be in TripView now
    expect(screen.getByRole('heading', { name: /Goa Trip/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /← back to trips/i })).toBeInTheDocument();
  });

  it('allows returning to dashboard and creating multiple trips', async () => {
    const user = userEvent.setup();
    renderApp();

    await createAndOpenTestTrip(user);
    
    // Go back
    await user.click(screen.getByRole('button', { name: /← back to trips/i }));
    
    expect(screen.getByRole('heading', { name: /Goa Trip/i })).toBeInTheDocument();
    
    // Create second trip
    await user.click(screen.getByRole('link', { name: /\+ create trip/i }));
    await user.type(screen.getByLabelText('Trip Name'), 'Manali Trip');
    await user.click(screen.getByRole('button', { name: 'Create Trip' }));
    
    expect(screen.getByRole('heading', { name: /Manali Trip/i })).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /← back to trips/i }));
    expect(screen.getByRole('heading', { name: /Goa Trip/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Manali Trip/i })).toBeInTheDocument();
  });

  it('allows editing and deleting trips from the dashboard', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);
    await user.click(screen.getByRole('button', { name: /← back to trips/i }));
    
    // Edit the trip (now a link)
    await user.click(screen.getByRole('link', { name: /edit/i }));
    
    const nameInput = screen.getByLabelText('Trip Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Kerala Trip');
    
    // Test date validation
    const startDate = screen.getByLabelText('Start Date');
    const endDate = screen.getByLabelText('End Date');
    await user.type(startDate, '2026-12-31');
    await user.type(endDate, '2026-12-25');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    
    expect(screen.getByText('Start date cannot be after end date.')).toBeInTheDocument();
    
    // Fix dates and save
    await user.clear(endDate);
    await user.type(endDate, '2027-01-05');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    
    // Now on TripView
    expect(screen.getByRole('heading', { name: /Kerala Trip/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Goa Trip/i })).not.toBeInTheDocument();
    
    // Go back to Dashboard
    await user.click(screen.getByRole('button', { name: /← back to trips/i }));
    
    // Open the trip from the dashboard (now a link)
    await user.click(screen.getByRole('link', { name: /open/i }));
    expect(screen.getByRole('heading', { name: /Kerala Trip/i })).toBeInTheDocument();
    
    // Go back and delete
    await user.click(screen.getByRole('button', { name: /← back to trips/i }));
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /Kerala Trip/i })).not.toBeInTheDocument();
    expect(screen.getByText('No trips yet.')).toBeInTheDocument();
  });

  it('validates trip form empty name', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: /\+ create trip/i }));
    
    const nameInput = screen.getByLabelText('Trip Name');
    await user.type(nameInput, '   ');
    await user.click(screen.getByRole('button', { name: 'Create Trip' }));
    
    expect(screen.getByText('Trip name is required.')).toBeInTheDocument();
    
    // Cancel creating trip
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByText('No trips yet.')).toBeInTheDocument();
  });

  // --- BACKUP TESTS ---

  it('handles exporting a backup', async () => {
    const user = userEvent.setup();
    
    // Mock URL and document.createElement for download
    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    renderApp();
    await createAndOpenTestTrip(user);
    await user.click(screen.getByRole('button', { name: /← back to trips/i }));
    
    await user.click(screen.getByRole('button', { name: /export backup/i }));
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
    expect(screen.getByText('Backup exported successfully.')).toBeInTheDocument();
  });

  it('handles importing a valid backup with replace', async () => {
    const user = userEvent.setup();
    renderApp();
    
    const file = new File([JSON.stringify({
      format: "travel-prep",
      version: 1,
      trips: [{ id: "t1", name: "Imported Trip", items: [] }]
    })], 'backup.json', { type: 'application/json' });
    
    const fileInput = screen.getByLabelText(/choose a travel prep json backup/i);
    await user.upload(fileInput, file);
    
    expect(await screen.findByText(/import 1 trip\(s\)\?/i)).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /replace existing trips/i }));
    
    expect(screen.getByText('Imported 1 trips successfully. Existing trips replaced.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Imported Trip/i })).toBeInTheDocument();
  });

  it('handles importing a valid backup with add', async () => {
    const user = userEvent.setup();
    renderApp();
    
    await createAndOpenTestTrip(user); // creates Goa Trip
    await user.click(screen.getByRole('button', { name: /← back to trips/i }));

    const file = new File([JSON.stringify({
      format: "travel-prep",
      version: 1,
      trips: [{ id: "t1", name: "Imported Trip", items: [] }]
    })], 'backup.json', { type: 'application/json' });
    
    const fileInput = screen.getByLabelText(/choose a travel prep json backup/i);
    await user.upload(fileInput, file);
    
    expect(await screen.findByText(/import 1 trip\(s\)\?/i)).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /add to existing trips/i }));
    
    expect(screen.getByText('Added 1 trips successfully.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Goa Trip/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Imported Trip/i })).toBeInTheDocument();
  });

  it('handles importing an invalid backup safely', async () => {
    const user = userEvent.setup();
    renderApp();
    
    const file = new File(['{bad json'], 'backup.json', { type: 'application/json' });
    
    const fileInput = screen.getByLabelText(/choose a travel prep json backup/i);
    await user.upload(fileInput, file);
    
    expect(await screen.findByText('Invalid backup file. The file is not valid JSON.')).toBeInTheDocument();
  });

  // --- EXISTING CHECKLIST TESTS INSIDE A TRIP ---

  it('allows user to add an item and reject empty descriptions', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    const input = screen.getByPlaceholderText('Item...');
    const addButton = screen.getByRole('button', { name: /add/i });

    // Reject empty
    await user.click(addButton);
    expect(screen.getByText('Item name cannot be empty.')).toBeInTheDocument();
    
    // Add valid
    await user.type(input, 'Passport');
    await user.click(addButton);
    
    expect(screen.getByText(/1 Passport/)).toBeInTheDocument();
    expect(screen.getByText(/1 items, 0 packed, 1 remaining, 0% complete/i)).toBeInTheDocument();
  });

  it('allows packing and unpacking items', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Passport');
    await user.click(screen.getByRole('button', { name: /add/i }));

    const checkbox = screen.getByRole('checkbox', { name: /mark passport as packed/i });
    
    // Pack
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText(/You got everything! Ready to go/i)).toBeInTheDocument();
    
    // Unpack
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('allows editing an item and changing category', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Passport');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await user.click(screen.getByRole('button', { name: /edit passport/i }));
    
    const editDescInput = screen.getByRole('textbox', { name: /edit description/i });
    await user.clear(editDescInput);
    await user.type(editDescInput, 'ID Card');

    const editCatSelect = screen.getByRole('combobox', { name: /edit category/i });
    await user.selectOptions(editCatSelect, 'DOCUMENTS');
    
    await user.click(screen.getByRole('button', { name: /save item/i }));
    
    expect(screen.getByText(/1 ID Card/)).toBeInTheDocument();
    expect(screen.queryByText(/1 Passport/)).not.toBeInTheDocument();
  });

  it('allows searching items and category filtering', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Passport');
    await user.selectOptions(screen.getByRole('combobox', { name: /item category/i }), 'DOCUMENTS');
    await user.click(screen.getByRole('button', { name: /add/i }));
    
    await user.type(screen.getByPlaceholderText('Item...'), 'Charger');
    await user.selectOptions(screen.getByRole('combobox', { name: /item category/i }), 'ELECTRONICS');
    await user.click(screen.getByRole('button', { name: /add/i }));

    const searchInput = screen.getByPlaceholderText('Search items...');
    await user.type(searchInput, 'Pass');

    expect(screen.getByText(/1 Passport/)).toBeInTheDocument();
    expect(screen.queryByText(/1 Charger/)).not.toBeInTheDocument();
    
    await user.clear(searchInput);
    
    // Filter Category
    const catFilter = screen.getByRole('combobox', { name: /filter by category/i });
    await user.selectOptions(catFilter, 'ELECTRONICS');
    
    expect(screen.queryByText(/1 Passport/)).not.toBeInTheDocument();
    expect(screen.getByText(/1 Charger/)).toBeInTheDocument();
  });

  it('clears completed items and clears all items', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Passport');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await user.type(screen.getByPlaceholderText('Item...'), 'Charger');
    await user.click(screen.getByRole('button', { name: /add/i }));

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // Pack Passport

    await user.click(screen.getByRole('button', { name: /clear completed/i }));
    
    expect(screen.queryByText('1 Passport')).not.toBeInTheDocument();
    expect(screen.getByText(/1 Charger/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear list/i }));
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.queryByText('1 Charger')).not.toBeInTheDocument();
    expect(screen.getByText('No items yet. Add your first packing item above.')).toBeInTheDocument();
  });

  it('persists data to localStorage across mounts', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Passport');
    await user.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/1 Passport/)).toBeInTheDocument();

    unmount();

    // Re-render simulates reload on the same deep link
    // test-uuid-0 is the trip ID, test-uuid-1 is the item ID
    render(
      <MemoryRouter initialEntries={["/trips/test-uuid-0"]}>
        <App />
      </MemoryRouter>
    );
    
    // We expect to still be in Goa Trip because URL is correct
    expect(screen.getByRole('heading', { name: /Goa Trip/i })).toBeInTheDocument();
    expect(screen.getByText(/1 Passport/)).toBeInTheDocument();
  });
  
  it('rejects invalid quantities', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    const input = screen.getByPlaceholderText('Item...');
    const qtyInput = screen.getByLabelText('Item quantity');
    const addButton = screen.getByRole('button', { name: /add/i });

    // Negative quantity
    await user.clear(qtyInput);
    await user.type(qtyInput, '-5');
    await user.type(input, 'Jacket');
    fireEvent.submit(addButton.closest('form'));
    
    expect(screen.getByText('Quantity must be at least 1.')).toBeInTheDocument();
  });

  it('rejects whitespace-only edit, allows canceling edit', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Passport');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await user.click(screen.getByRole('button', { name: /edit passport/i }));
    const editDescInput = screen.getByRole('textbox', { name: /edit description/i });
    
    await user.clear(editDescInput);
    await user.type(editDescInput, '   ');
    await user.click(screen.getByRole('button', { name: /save item/i }));
    
    expect(screen.getByText('Item name cannot be empty.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel edit/i }));
    expect(screen.queryByText('Item name cannot be empty.')).not.toBeInTheDocument();
    expect(screen.getByText(/1 Passport/)).toBeInTheDocument();
  });

  it('allows deleting an item', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Passport');
    await user.click(screen.getByRole('button', { name: /add/i }));
    
    await user.click(screen.getByRole('button', { name: /delete passport/i }));
    expect(screen.queryByText('1 Passport')).not.toBeInTheDocument();
  });

  it('supports sorting items', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Zebra');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await user.type(screen.getByPlaceholderText('Item...'), 'Apple');
    await user.click(screen.getByRole('button', { name: /add/i }));

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Pack Apple

    const sortSelect = screen.getByLabelText('Sort items');
    
    // Alphabetical
    await user.selectOptions(sortSelect, 'description');
    const itemsDesc = screen.getAllByRole('listitem');
    expect(itemsDesc[0]).toHaveTextContent(/Apple/);
    expect(itemsDesc[1]).toHaveTextContent(/Zebra/);

    // Unpacked first
    await user.selectOptions(sortSelect, 'unpacked');
    const itemsUnpacked = screen.getAllByRole('listitem');
    expect(itemsUnpacked[0]).toHaveTextContent(/Zebra/); // Unpacked
    expect(itemsUnpacked[1]).toHaveTextContent(/Apple/); // Packed
  });
  
  it('creates trip from template', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: /\+ create trip/i }));
    await user.type(screen.getByLabelText('Trip Name'), 'Beach Vacay');
    await user.selectOptions(screen.getByRole('combobox', { name: /trip template/i }), 'beach');
    await user.click(screen.getByRole('button', { name: 'Create Trip' }));
    
    // Should have imported beach items like "T-Shirts"
    expect(screen.getByRole('heading', { name: /Beach Vacay/i })).toBeInTheDocument();
    expect(screen.getByText(/4 T-Shirts/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Sunscreen/i)).toBeInTheDocument();
  });
  it('allows reordering items manually', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'First');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByPlaceholderText('Item...'), 'Second');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByPlaceholderText('Item...'), 'Third');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    let listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent(/First/);
    expect(listItems[1]).toHaveTextContent(/Second/);
    expect(listItems[2]).toHaveTextContent(/Third/);

    const moveUpBtn = screen.getByRole('button', { name: /Move Second up/i });
    await user.click(moveUpBtn);

    listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent(/Second/);
    expect(listItems[1]).toHaveTextContent(/First/);
    expect(listItems[2]).toHaveTextContent(/Third/);

    const moveDownBtn = screen.getByRole('button', { name: /Move First down/i });
    await user.click(moveDownBtn);

    listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent(/Second/);
    expect(listItems[1]).toHaveTextContent(/Third/);
    expect(listItems[2]).toHaveTextContent(/First/);
  });

  it('disables reordering when sorting or filtering is active', async () => {
    const user = userEvent.setup();
    renderApp();
    await createAndOpenTestTrip(user);

    await user.type(screen.getByPlaceholderText('Item...'), 'Apple');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByPlaceholderText('Item...'), 'Banana');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    let moveUpBtns = screen.queryAllByRole('button', { name: /Move .* up/i });
    expect(moveUpBtns.length).toBeGreaterThan(0);

    // Apply Sort A-Z
    await user.selectOptions(screen.getByRole('combobox', { name: /Sort items/i }), 'description');
    
    // Move buttons should be disabled / not rendered
    moveUpBtns = screen.queryAllByRole('button', { name: /Move .* up/i });
    expect(moveUpBtns.length).toBe(0);

    // Search query
    await user.selectOptions(screen.getByRole('combobox', { name: /Sort items/i }), 'input'); // Reset
    await user.type(screen.getByRole('searchbox', { name: /Search items/i }), 'Apple');
    
    // Move buttons should be disabled
    moveUpBtns = screen.queryAllByRole('button', { name: /Move .* up/i });
    expect(moveUpBtns.length).toBe(0);
  });
});

