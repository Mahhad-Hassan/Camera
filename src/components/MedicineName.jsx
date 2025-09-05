export default function MedicineName({ value, onChange }) {
  return (
    <>
    <h3 className="font-semibold">Medicine Name</h3>
    <input
      type="text"
      placeholder="Enter medicine name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded-md mb-4 w-full"
    />
    </>
  );
}
