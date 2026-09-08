import Logo from "./Logo";
import ThemeSelector from "./ThemeSelector";

export default function Header({ theme, setTheme }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <Logo />
        <ThemeSelector theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
}
