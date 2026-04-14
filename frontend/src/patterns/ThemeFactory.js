/**
 * PATRÓN ABSTRACT FACTORY — Temas Visuales (Light / Dark)
 *
 * Problema: La aplicación soporta dos temas (claro y oscuro). Cada tema
 * necesita una familia coherente de colores: fondos, textos, cards,
 * bordes, botones primarios, etc. Cambiar el tema implica reemplazar
 * toda esa familia de forma consistente.
 *
 * Solución: Definir una fábrica abstracta (ThemeFactory) con métodos
 * para crear cada "pieza" del tema. Dos fábricas concretas
 * (LightThemeFactory y DarkThemeFactory) producen familias compatibles.
 * El consumidor (ThemeContext) solo conoce la interfaz abstracta.
 *
 * Estructura:
 *   ThemeFactory (abstracta)
 *       ├── LightThemeFactory  → Colores claros, sombras suaves
 *       └── DarkThemeFactory   → Colores oscuros, sombras profundas
 *
 * Cada factory produce:
 *   - colors      → paleta completa de colores CSS
 *   - typography  → pesos y tamaños de fuente
 *   - shadows     → sombras de elevación
 *   - components  → estilos base para componentes específicos
 */

// ─── Fábrica abstracta ────────────────────────────────────────────────────────
class ThemeFactory {
  createColors()     { throw new Error('createColors() no implementado'); }
  createShadows()    { throw new Error('createShadows() no implementado'); }
  createComponents() { throw new Error('createComponents() no implementado'); }

  buildTheme() {
    const name = this.constructor.name.replace('ThemeFactory', '').toLowerCase();
    console.log(`🎨 [Abstract Factory] Construyendo tema: "${name}"`);
    return {
      name,
      colors:     this.createColors(),
      shadows:    this.createShadows(),
      components: this.createComponents(),
    };
  }
}

// ─── Fábrica concreta: Tema Claro ─────────────────────────────────────────────
class LightThemeFactory extends ThemeFactory {
  createColors() {
    return {
      bgPrimary:    '#F9FAFB',
      bgSecondary:  '#FFFFFF',
      bgTertiary:   '#F3F4F6',
      bgHover:      '#E5E7EB',
      textPrimary:  '#111827',
      textSecondary:'#4B5563',
      textMuted:    '#9CA3AF',
      textInverse:  '#FFFFFF',
      border:       '#E5E7EB',
      borderHover:  '#D1D5DB',
      accent:       '#2563EB',
      accentHover:  '#1D4ED8',
      accentLight:  '#EFF6FF',
      success:      '#10B981',
      successLight: '#D1FAE5',
      warning:      '#F59E0B',
      warningLight: '#FEF3C7',
      error:        '#EF4444',
      errorLight:   '#FEE2E2',
      info:         '#3B82F6',
      infoLight:    '#DBEAFE',
      columnBg:     '#F3F4F6',
      cardBg:       '#FFFFFF',
    };
  }

  createShadows() {
    return {
      sm: '0 1px 2px 0 rgba(0,0,0,0.04)',
      md: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.03)',
      lg: '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.03)',
      xl: '0 20px 25px -5px rgba(0,0,0,0.07)',
    };
  }

  createComponents() {
    return {
      navbar:   { bg: '#FFFFFF',  borderBottom: '1px solid #E5E7EB' },
      sidebar:  { bg: '#F9FAFB', borderRight:  '1px solid #E5E7EB' },
      card:     { bg: '#FFFFFF',  border: '1px solid #E5E7EB', borderRadius: '12px' },
      input:    { bg: '#FFFFFF',  border: '1px solid #D1D5DB', focusBorder: '#2563EB' },
      badge:    { borderRadius: '6px', fontWeight: '600', fontSize: '11px' },
      button: {
        primary:   { bg: '#2563EB', color: '#FFFFFF', hover: '#1D4ED8' },
        secondary: { bg: '#F3F4F6', color: '#4B5563', hover: '#E5E7EB' },
        danger:    { bg: '#EF4444', color: '#FFFFFF', hover: '#DC2626' },
      },
    };
  }
}

// ─── Fábrica concreta: Tema Oscuro ────────────────────────────────────────────
class DarkThemeFactory extends ThemeFactory {
  createColors() {
    return {
      bgPrimary:    '#09090B',
      bgSecondary:  '#111113',
      bgTertiary:   '#18181B',
      bgHover:      '#27272A',
      textPrimary:  '#FAFAFA',
      textSecondary:'#A1A1AA',
      textMuted:    '#52525B',
      textInverse:  '#09090B',
      border:       '#27272A',
      borderHover:  '#3F3F46',
      accent:       '#3B82F6',
      accentHover:  '#2563EB',
      accentLight:  '#172554',
      success:      '#34D399',
      successLight: '#064E3B',
      warning:      '#FBBF24',
      warningLight: '#451A03',
      error:        '#F87171',
      errorLight:   '#450A0A',
      info:         '#60A5FA',
      infoLight:    '#1E3A5F',
      columnBg:     '#18181B',
      cardBg:       '#111113',
    };
  }

  createShadows() {
    return {
      sm: '0 1px 2px 0 rgba(0,0,0,0.5)',
      md: '0 4px 6px -1px rgba(0,0,0,0.6), 0 2px 4px -1px rgba(0,0,0,0.5)',
      lg: '0 10px 15px -3px rgba(0,0,0,0.7), 0 4px 6px -2px rgba(0,0,0,0.5)',
      xl: '0 20px 25px -5px rgba(0,0,0,0.8)',
    };
  }

  createComponents() {
    return {
      navbar:   { bg: '#111113', borderBottom: '1px solid #27272A' },
      sidebar:  { bg: '#09090B', borderRight:  '1px solid #27272A' },
      card:     { bg: '#111113', border: '1px solid #27272A', borderRadius: '12px' },
      input:    { bg: '#09090B', border: '1px solid #27272A', focusBorder: '#3B82F6' },
      badge:    { borderRadius: '6px', fontWeight: '600', fontSize: '11px' },
      button: {
        primary:   { bg: '#3B82F6', color: '#FFFFFF', hover: '#2563EB' },
        secondary: { bg: '#27272A', color: '#A1A1AA', hover: '#3F3F46' },
        danger:    { bg: '#F87171', color: '#09090B', hover: '#EF4444' },
      },
    };
  }
}

// ─── Función de acceso ────────────────────────────────────────────────────────
function getThemeFactory(themeName) {
  const factories = { light: LightThemeFactory, dark: DarkThemeFactory };
  const Factory = factories[themeName] || LightThemeFactory;
  return new Factory();
}

export { getThemeFactory, LightThemeFactory, DarkThemeFactory };