import type { Lab, LabId } from "../types/lab";

type LabSelectorProps = {
  labs: Lab[];
  activeLabId: LabId;
  onSelect: (labId: LabId) => void;
};

export function LabSelector({ labs, activeLabId, onSelect }: LabSelectorProps) {
  return (
    <aside className="lab-selector" aria-label="Daftar simulasi lab">
      <h2>Pilih Lab</h2>
      <div className="lab-list">
        {labs.map((lab) => (
          <button
            key={lab.id}
            className={activeLabId === lab.id ? "lab-card active" : "lab-card"}
            onClick={() => onSelect(lab.id)}
          >
            <span className="lab-icon">{lab.icon}</span>
            <span>
              <strong>{lab.title}</strong>
              <small>{lab.subtitle}</small>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
