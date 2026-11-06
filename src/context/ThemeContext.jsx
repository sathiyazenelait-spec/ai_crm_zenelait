import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'indigo',
    name: 'Electric Indigo',
    badge: 'Classic Blue',
    defaultLayout: 'sidebar',
    layoutName: 'Vertical Sidebar Layout',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
    previewColor: '#2563eb'
  },
  {
    id: 'orange-red',
    name: 'Orange Red Sunset',
    badge: 'Fiery Gradient',
    defaultLayout: 'topnav',
    layoutName: 'Horizon Top-Nav Layout',
    gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
    previewColor: '#ff4b2b'
  },
  {
    id: 'purple-rose',
    name: 'Purple Rose Neon',
    badge: 'Magenta Glow',
    defaultLayout: 'floating-dock',
    layoutName: 'Floating Glass Dock Layout',
    gradient: 'linear-gradient(135deg, #7928ca 0%, #d946ef 50%, #ff0080 100%)',
    previewColor: '#a855f7'
  }
];

export const LAYOUTS = [
  {
    id: 'sidebar',
    name: 'Sidebar Pro',
    desc: 'Classic vertical sidebar on left'
  },
  {
    id: 'topnav',
    name: 'Top Horizon',
    desc: 'Full-width top navigation header'
  },
  {
    id: 'floating-dock',
    name: 'Floating Glass Dock',
    desc: 'Modern floating rounded capsule dock'
  }
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('zenelait_theme') || 'indigo';
  });

  const [layout, setLayout] = useState(() => {
    return localStorage.getItem('zenelait_layout') || 'sidebar';
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('zenelait_mode') || 'dark';
  });

  // Automatically switch theme AND layout together, or independently
  const selectTheme = (themeId, syncLayout = true) => {
    setThemeState(themeId);
    if (syncLayout) {
      const found = THEMES.find(t => t.id === themeId);
      if (found?.defaultLayout) {
        setLayout(found.defaultLayout);
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenelait_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-layout', layout);
    localStorage.setItem('zenelait_layout', layout);
  }, [layout]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('zenelait_mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: selectTheme,
        layout,
        setLayout,
        mode,
        setMode,
        toggleMode,
        THEMES,
        LAYOUTS
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
