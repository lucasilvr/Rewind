export default function FavoritesTab() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-bold text-zinc-900 mb-4">Reviews</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="aspect-square bg-zinc-200 rounded">Review 1</div>
        <div className="aspect-square bg-zinc-200 rounded">Review 2</div>
      </div>
    </div>
  );
}