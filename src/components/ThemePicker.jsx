import { useState } from "react";
import { Palette, Check } from "lucide-react";

const THEMES = [
  { key: "default", label: "Default", swatch: "#6c5ce7" },
  { key: "dark", label: "Dark", swatch: "#1a1a1a" },
  { key: "ocean", label: "Ocean", swatch: "#64ffda" },
  { key: "forest", label: "Forest", swatch: "#2ecc71" },
  { key: "vanilla", label: "Vanilla", swatch: "#f5f0e6" },
];

export default function ThemePicker({ theme, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="theme-picker">
      <button
        className="theme-picker-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title="Change theme"
      >
        <Palette size={18} />
      </button>
      {open && (
        <div className="theme-picker-dropdown" onClick={(e) => e.stopPropagation()}>
          {THEMES.map((t) => (
            <button
              key={t.key}
              className={`theme-picker-option ${theme === t.key ? "active" : ""}`}
              onClick={() => {
                onChange(t.key);
                setOpen(false);
              }}
            >
              <span
                className="theme-picker-swatch"
                style={{
                  background: t.swatch,
                  border: t.key === "vanilla" || t.key === "dark" ? "1px solid var(--border-glass)" : "none",
                }}
              />
              <span className="theme-picker-label">{t.label}</span>
              {theme === t.key && <Check size={14} className="theme-picker-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
