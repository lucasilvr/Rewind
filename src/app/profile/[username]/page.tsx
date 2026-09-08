// profile/[username]/page.tsx
interface RootProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function RootProfilePage({
  params,
}: RootProfilePageProps) {
  const { username } = await params;

  return (
    <div className="bg-transparent">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-zinc-100">
          <div className="aspect-square bg-zinc-200 rounded mb-2">
            Capa do Álbum Exemplo
          </div>
          <h3 className="font-semibold text-sm">Album exemplo</h3>
          <p className="text-xs text-zinc-500">Various</p>
        </div>
      </div>
    </div>
  );
}
