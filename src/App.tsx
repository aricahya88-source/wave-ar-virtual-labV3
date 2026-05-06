import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { HomeView } from "./components/HomeView";
import { LabSelector } from "./components/LabSelector";
import { GuideView } from "./components/GuideView";
import { TheoryView } from "./components/TheoryView";
import { SimulationView } from "./components/SimulationView";
import { labs } from "./data/labs";
import type { LabId } from "./types/lab";

type ViewMode = "home" | "guide" | "theory" | "simulation";
type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "wave-ar-virtual-lab-theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function App() {
  const [activeLabId, setActiveLabId] = useState<LabId>("reflection");
  const [activeView, setActiveView] = useState<ViewMode>("home");
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  const activeLab = useMemo(() => labs.find((lab) => lab.id === activeLabId) ?? labs[0], [activeLabId]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  return (
    <main className="app-shell">
      <Header activeView={activeView} onChangeView={setActiveView} theme={theme} onToggleTheme={toggleTheme} />

      <div className="main-layout">
        <LabSelector labs={labs} activeLabId={activeLabId} onSelect={setActiveLabId} />

        <div className="workspace">
          {activeView === "home" && <HomeView labs={labs} onStart={() => setActiveView("simulation")} />}
          {activeView === "guide" && <GuideView lab={activeLab} />}
          {activeView === "theory" && <TheoryView lab={activeLab} />}
          {activeView === "simulation" && <SimulationView lab={activeLab} />}
        </div>
      </div>
    </main>
  );
}
