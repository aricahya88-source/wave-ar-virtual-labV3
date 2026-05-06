import { Beaker, BookOpen, Hand, Moon, Sun, Waves } from "lucide-react";

type HeaderProps = {
  activeView: string;
  onChangeView: (view: "home" | "guide" | "theory" | "simulation") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function Header({ activeView, onChangeView, theme, onToggleTheme }: HeaderProps) {
  const navItems = [
    { id: "home", label: "Beranda", icon: Waves },
    { id: "guide", label: "Panduan", icon: Hand },
    { id: "theory", label: "Landasan Teori", icon: BookOpen },
    { id: "simulation", label: "Simulasi", icon: Beaker }
  ] as const;

  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const nextThemeLabel = theme === "dark" ? "Mode terang" : "Mode gelap";

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Virtual Lab AR</p>
        <h1>Gejala Gelombang</h1>
        <p className="header-subtitle">Pemantulan, pembiasan, interferensi, dan difraksi dalam ruang 3D interaktif.</p>
      </div>

      <div className="header-actions">
        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Aktifkan ${nextThemeLabel}`}>
          <ThemeIcon size={16} />
          <span>{nextThemeLabel}</span>
        </button>

        <nav className="top-nav" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeView === item.id ? "nav-button active" : "nav-button"}
                onClick={() => onChangeView(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
