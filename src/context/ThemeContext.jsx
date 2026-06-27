import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('timecapsule-theme') || 'dark';
  });

  const changeTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('timecapsule-theme', newTheme);
  };

  useEffect(() => {
    // Remove any existing theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-pink', 'theme-sunset', 'theme-space');
    
    // Add active theme class
    if (theme !== 'dark') { // dark is the default :root
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
