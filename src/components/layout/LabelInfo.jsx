export function LabelInfo({ label, value }) {
  return (
    <div>
      <div className="text-sm text-stone-400 font-black">{label}</div>
      <div className="text-lg text-stone-700">{value}</div>
    </div>
  );
}
