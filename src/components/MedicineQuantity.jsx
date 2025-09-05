export default function MedicineQuantity({ value, onChange }) {
  return (
    <>
    <h3 className="font-semibold">Medicine Quantity</h3>
    <input
      type="number"
      placeholder="Enter medicine quantity"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded-md mb-4 w-full"
    />
    </>
  );
}
