import { createContext } from "react"

type Theme = "dark" | "light" | "system"

export type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)
