export default function Stats({ items }) {
  if (!items.length) {
    return (
      <footer className="stats">
        <em>Start adding some items to your packing list 🚀</em>
        <div className="w-full flex justify-center mt-sm">
          <progress value="0" max="100" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{ width: "50%", maxWidth: "400px", height: "2rem", accentColor: "var(--color-primary)" }} />
        </div>
      </footer>
    );
  }
  const numItems = items.length;
  const numPackeds = items.filter((item) => item.packed).length;
  const remainingCount = numItems - numPackeds;
  const percentage = Math.round((numPackeds / numItems) * 100);

  return (
    <footer className="stats">
      <em>
        {percentage === 100
          ? "You got everything! Ready to go ✈️"
          : `💼 ${numItems} items, ${numPackeds} packed, ${remainingCount} remaining, ${percentage}% complete`}
      </em>
      <div className="w-full flex justify-center mt-sm">
        <progress 
          value={numPackeds} 
          max={numItems}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          style={{ width: "50%", maxWidth: "400px", height: "2rem", accentColor: "var(--color-primary)" }}
        />
      </div>
    </footer>
  );
}
