export default function ThemeSelector({ theme, setTheme }) {
  return (
    <div className="theme-selector">
      <label htmlFor="theme-select" className="sr-only">Select Theme</label>
      <select 
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="theme-select"
        aria-label="Select application theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
