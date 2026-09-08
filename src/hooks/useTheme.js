import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Initial state setup is handled by index.html script,
    // but we need to sync React state with localStorage or default to "system"
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("travel-prep-theme");
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    }
    return "system";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Save preference to localStorage
    window.localStorage.setItem("travel-prep-theme", theme);

    const applyTheme = (currentTheme) => {
      const root = document.documentElement;
      if (currentTheme === "system") {
        const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", systemPrefersDark ? "dark" : "light");
        
        // Update theme color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute("content", systemPrefersDark ? "#121212" : "#ffffff");
        }
      } else {
        root.setAttribute("data-theme", currentTheme);
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute("content", currentTheme === "dark" ? "#121212" : "#ffffff");
        }
      }
    };

    applyTheme(theme);

    // Listen to system changes if we are on "system"
    let mediaQuery;
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    
    if (window.matchMedia) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", handleChange);
    }
    
    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  }, [theme]);

  return [theme, setTheme];
}
