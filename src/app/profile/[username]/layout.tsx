// profile/[username]/layout.tsx
import Link from "next/link";
import React from "react";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfileLayout({ children, params }: ProfileLayoutProps) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="max-w-6xl mx-auto pt-10 px-8">
        
        <header className="mb-10">
          <div className="flex items-center gap-4">
             <div className="w-20 h-20 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-2xl">
                {username.substring(0, 2).toUpperCase()}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-zinc-900">Perfil de {username}</h1>
               <p className="text-sm text-zinc-500">@{username} • Membro desde 2022</p>
             </div>
          </div>
        </header>

        <nav className="flex gap-6 mb-8 text-sm font-medium text-zinc-500 border-b border-zinc-200">
          <Link
            href={`/profile/${username}`}
            className="hover:text-zinc-950 pb-3 border-b-2 border-transparent hover:border-zinc-950"
          >
            Álbuns Ouvidos
          </Link>
          <Link
            href={`/profile/${username}/reviews`}
            className="hover:text-zinc-950 pb-3 border-b-2 border-transparent hover:border-zinc-950"
          >
            Reviews
          </Link>
          <Link
            href={`/profile/${username}/favorites`}
            className="hover:text-zinc-950 pb-3 border-b-2 border-transparent hover:border-zinc-950"
          >
            Favoritos
          </Link>
        </nav>

        <section>
          {children}
        </section>
        
      </main>
    </div>
  );
}