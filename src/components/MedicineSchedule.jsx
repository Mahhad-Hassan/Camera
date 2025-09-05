export default function MedicineSchedule({ value, onChange }) {
  return (
    <>
      <h3 className="font-semibold">Medicine Schedule</h3>
      <input
        type="text"
        placeholder="Enter medicine schedule (e.g. 2 times a day)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded-md mb-4 w-full"
      />
    </>
  );
}
