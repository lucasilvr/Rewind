interface AlbumDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AlbumDetailPage = async ({ params }: AlbumDetailPageProps) => {
  const { id } = await params;

  return <div>Album: {id}</div>;
};

export default AlbumDetailPage;
