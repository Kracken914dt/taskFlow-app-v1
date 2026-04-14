import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getThemeFactory } from '../patterns/ThemeFactory';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem('tf_theme') || 'light'
  );

  // PATRÓN ABSTRACT FACTORY: la fábrica construye el tema completo
  const theme = useMemo(() => {
    const factory = getThemeFactory(themeName);
    return factory.buildTheme();
  }, [themeName]);

  // Aplicar variables CSS al :root para que todos los componentes las usen
  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    const s = theme.shadows;

    root.style.setProperty('--bg-primary',    c.bgPrimary);
    root.style.setProperty('--bg-secondary',  c.bgSecondary);
    root.style.setProperty('--bg-tertiary',   c.bgTertiary);
    root.style.setProperty('--bg-hover',      c.bgHover);
    root.style.setProperty('--text-primary',  c.textPrimary);
    root.style.setProperty('--text-secondary',c.textSecondary);
    root.style.setProperty('--text-muted',    c.textMuted);
    root.style.setProperty('--border',        c.border);
    root.style.setProperty('--border-hover',  c.borderHover);
    root.style.setProperty('--accent',        c.accent);
    root.style.setProperty('--accent-hover',  c.accentHover);
    root.style.setProperty('--accent-light',  c.accentLight);
    root.style.setProperty('--success',       c.success);
    root.style.setProperty('--success-light', c.successLight);
    root.style.setProperty('--warning',       c.warning);
    root.style.setProperty('--warning-light', c.warningLight);
    root.style.setProperty('--error',         c.error);
    root.style.setProperty('--error-light',   c.errorLight);
    root.style.setProperty('--info',          c.info);
    root.style.setProperty('--info-light',    c.infoLight);
    root.style.setProperty('--column-bg',     c.columnBg);
    root.style.setProperty('--card-bg',       c.cardBg);
    root.style.setProperty('--shadow-sm',     s.sm);
    root.style.setProperty('--shadow-md',     s.md);
    root.style.setProperty('--shadow-lg',     s.lg);

    localStorage.setItem('tf_theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  }, [theme, themeName]);

  const toggleTheme = () => {
    setThemeName(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
};
