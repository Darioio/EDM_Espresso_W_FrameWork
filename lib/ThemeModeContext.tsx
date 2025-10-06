import React, { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
};

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'light',
  toggle: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
