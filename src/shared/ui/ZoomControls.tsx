export const ZoomControls = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const set = (next: number) => onChange(Math.min(2, Math.max(0.5, Math.round(next * 10) / 10)));
  return (
    <div className="zoomControls" aria-label="Масштаб">
      <button type="button" onClick={() => set(value - 0.1)} title="Уменьшить масштаб">−</button>
      <button type="button" onClick={() => set(1)} title="Сбросить масштаб">{Math.round(value * 100)}%</button>
      <button type="button" onClick={() => set(value + 0.1)} title="Увеличить масштаб">+</button>
    </div>
  );
};
