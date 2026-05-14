export const NumberEdit = ({ label, value, onChange }: { label: string; value?: number; onChange: (value: number | undefined) => void }) => (
  <label>{label}<input type="number" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))} /></label>
);
